use anyhow::{Context as _, Result, bail};
use base64::{
    Engine as _,
    engine::general_purpose::{STANDARD, URL_SAFE, URL_SAFE_NO_PAD},
};
use percent_encoding::percent_decode_str;
use serde_json::Value as JsonValue;
use serde_yaml_ng::{Mapping, Value as YamlValue};
use std::collections::HashSet;
use url::Url;

/// Decode a URL-encoded string safely
fn decode_percent(s: &str) -> String {
    percent_decode_str(s).decode_utf8_lossy().to_string()
}

/// Try to decode Base64 string with various padding/dialects
fn try_decode_base64(input: &str) -> Option<String> {
    let clean = input
        .chars()
        .filter(|c| !c.is_whitespace())
        .collect::<std::string::String>();
    if clean.len() < 8 {
        return None;
    }

    // Try standard base64 first
    if let Ok(bytes) = STANDARD.decode(&clean)
        && let Ok(text) = std::str::from_utf8(&bytes)
        && text.is_ascii() || !text.contains('\0')
    {
        return Some(text.to_string());
    }

    // Try URL-safe base64
    if let Ok(bytes) = URL_SAFE.decode(&clean)
        && let Ok(text) = std::str::from_utf8(&bytes)
    {
        return Some(text.to_string());
    }

    if let Ok(bytes) = URL_SAFE_NO_PAD.decode(&clean)
        && let Ok(text) = std::str::from_utf8(&bytes)
    {
        return Some(text.to_string());
    }

    None
}

/// Check if content is already valid Clash YAML containing proxies or proxy-providers
pub fn is_clash_yaml(content: &str) -> bool {
    let trimmed = content.trim();
    if trimmed.is_empty() {
        return false;
    }

    if let Ok(yaml) = serde_yaml_ng::from_str::<Mapping>(trimmed) {
        return yaml.contains_key("proxies") || yaml.contains_key("proxy-providers");
    }
    false
}

/// Parse Shadowsocks link:
/// `ss://BASE64(method:password@host:port)#name` or `ss://BASE64(method:password)@host:port#name`
fn parse_ss_link(link: &str) -> Option<Mapping> {
    let rest = link.strip_prefix("ss://")?;
    let (body, tag) = match rest.split_once('#') {
        Some((b, t)) => (b, decode_percent(t)),
        None => (rest, "SS Node".to_string()),
    };

    let mut map = Mapping::new();
    map.insert(YamlValue::from("type"), YamlValue::from("ss"));

    if body.contains('@') {
        let (user_info, host_port) = body.split_once('@')?;
        let user_info = try_decode_base64(user_info).unwrap_or_else(|| user_info.to_string());
        let (cipher, password) = user_info.split_once(':')?;

        let (server_port, plugin) = match host_port.split_once("/?") {
            Some((hp, q)) => (hp, Some(q)),
            None => (host_port, None),
        };
        let (server, port) = server_port.rsplit_once(':')?;

        map.insert(YamlValue::from("name"), YamlValue::from(tag));
        map.insert(YamlValue::from("server"), YamlValue::from(server));
        map.insert(
            YamlValue::from("port"),
            YamlValue::from(port.parse::<u16>().ok()?),
        );
        map.insert(YamlValue::from("cipher"), YamlValue::from(cipher));
        map.insert(YamlValue::from("password"), YamlValue::from(password));

        if let Some(plugin_str) = plugin {
            for param in plugin_str.split('&') {
                if let Some(val) = param.strip_prefix("plugin=") {
                    let decoded_plugin = decode_percent(val);
                    if let Some((pname, popts)) = decoded_plugin.split_once(';') {
                        map.insert(YamlValue::from("plugin"), YamlValue::from(pname));
                        let mut opt_map = Mapping::new();
                        for opt in popts.split(';') {
                            if let Some((k, v)) = opt.split_once('=') {
                                opt_map.insert(YamlValue::from(k), YamlValue::from(v));
                            }
                        }
                        map.insert(YamlValue::from("plugin-opts"), YamlValue::Mapping(opt_map));
                    } else {
                        map.insert(YamlValue::from("plugin"), YamlValue::from(decoded_plugin));
                    }
                }
            }
        }
        return Some(map);
    }

    // Format: ss://BASE64(method:password@host:port)
    let decoded = try_decode_base64(body)?;
    let (user_info, host_port) = decoded.split_once('@')?;
    let (cipher, password) = user_info.split_once(':')?;
    let (server, port) = host_port.rsplit_once(':')?;

    map.insert(YamlValue::from("name"), YamlValue::from(tag));
    map.insert(YamlValue::from("server"), YamlValue::from(server));
    map.insert(
        YamlValue::from("port"),
        YamlValue::from(port.parse::<u16>().ok()?),
    );
    map.insert(YamlValue::from("cipher"), YamlValue::from(cipher));
    map.insert(YamlValue::from("password"), YamlValue::from(password));
    Some(map)
}

/// Parse ShadowsocksR link: `ssr://BASE64`
fn parse_ssr_link(link: &str) -> Option<Mapping> {
    let b64 = link.strip_prefix("ssr://")?;
    let decoded = try_decode_base64(b64)?;

    let (main, params) = match decoded.split_once("/?") {
        Some((m, p)) => (m, Some(p)),
        None => (decoded.as_str(), None),
    };

    let parts: Vec<&str> = main.split(':').collect();
    if parts.len() < 6 {
        return None;
    }

    let server = parts[0];
    let port = parts[1].parse::<u16>().ok()?;
    let protocol = parts[2];
    let cipher = parts[3];
    let obfs = parts[4];
    let password = try_decode_base64(parts[5]).unwrap_or_else(|| parts[5].to_string());

    let mut name = "SSR Node".to_string();
    let mut obfs_param = None;
    let mut proto_param = None;

    if let Some(params) = params {
        for item in params.split('&') {
            if let Some((k, v)) = item.split_once('=') {
                match k {
                    "remarks" => {
                        if let Some(r) = try_decode_base64(v) {
                            name = r;
                        }
                    }
                    "obfsparam" => {
                        obfs_param = try_decode_base64(v);
                    }
                    "protoparam" => {
                        proto_param = try_decode_base64(v);
                    }
                    _ => {}
                }
            }
        }
    }

    let mut map = Mapping::new();
    map.insert(YamlValue::from("name"), YamlValue::from(name));
    map.insert(YamlValue::from("type"), YamlValue::from("ssr"));
    map.insert(YamlValue::from("server"), YamlValue::from(server));
    map.insert(YamlValue::from("port"), YamlValue::from(port));
    map.insert(YamlValue::from("cipher"), YamlValue::from(cipher));
    map.insert(YamlValue::from("password"), YamlValue::from(password));
    map.insert(YamlValue::from("protocol"), YamlValue::from(protocol));
    map.insert(YamlValue::from("obfs"), YamlValue::from(obfs));
    if let Some(op) = obfs_param {
        map.insert(YamlValue::from("obfs-param"), YamlValue::from(op));
    }
    if let Some(pp) = proto_param {
        map.insert(YamlValue::from("protocol-param"), YamlValue::from(pp));
    }

    Some(map)
}

/// Parse VMess link: `vmess://BASE64(json)`
fn parse_vmess_link(link: &str) -> Option<Mapping> {
    let b64 = link.strip_prefix("vmess://")?;
    let decoded = try_decode_base64(b64)?;
    let json: JsonValue = serde_json::from_str(&decoded).ok()?;

    let name = json["ps"]
        .as_str()
        .map(|s| s.to_string())
        .unwrap_or_else(|| "VMess Node".to_string());
    let server = json["add"].as_str()?.to_string();
    let port = json["port"]
        .as_u64()
        .or_else(|| json["port"].as_str()?.parse().ok())? as u16;
    let uuid = json["id"].as_str()?.to_string();
    let alter_id = json["aid"]
        .as_u64()
        .or_else(|| json["aid"].as_str().and_then(|s| s.parse().ok()))
        .unwrap_or(0);
    let cipher = json["scy"].as_str().unwrap_or("auto");
    let net = json["net"].as_str().unwrap_or("tcp");
    let tls = json["tls"].as_str().map(|s| s == "tls").unwrap_or(false);

    let mut map = Mapping::new();
    map.insert(YamlValue::from("name"), YamlValue::from(name));
    map.insert(YamlValue::from("type"), YamlValue::from("vmess"));
    map.insert(YamlValue::from("server"), YamlValue::from(server));
    map.insert(YamlValue::from("port"), YamlValue::from(port));
    map.insert(YamlValue::from("uuid"), YamlValue::from(uuid));
    map.insert(YamlValue::from("alterId"), YamlValue::from(alter_id));
    map.insert(YamlValue::from("cipher"), YamlValue::from(cipher));
    map.insert(YamlValue::from("network"), YamlValue::from(net));
    map.insert(YamlValue::from("tls"), YamlValue::from(tls));

    if let Some(sni) = json["sni"].as_str().filter(|s| !s.is_empty()) {
        map.insert(YamlValue::from("servername"), YamlValue::from(sni));
    }

    if net == "ws" {
        let mut ws_opts = Mapping::new();
        if let Some(path) = json["path"].as_str().filter(|s| !s.is_empty()) {
            ws_opts.insert(YamlValue::from("path"), YamlValue::from(path));
        }
        if let Some(host) = json["host"].as_str().filter(|s| !s.is_empty()) {
            let mut headers = Mapping::new();
            headers.insert(YamlValue::from("Host"), YamlValue::from(host));
            ws_opts.insert(YamlValue::from("headers"), YamlValue::Mapping(headers));
        }
        map.insert(YamlValue::from("ws-opts"), YamlValue::Mapping(ws_opts));
    } else if net == "grpc" {
        let mut grpc_opts = Mapping::new();
        if let Some(path) = json["path"].as_str().filter(|s| !s.is_empty()) {
            grpc_opts.insert(
                YamlValue::from("grpc-service-name"),
                YamlValue::from(path),
            );
        }
        map.insert(YamlValue::from("grpc-opts"), YamlValue::Mapping(grpc_opts));
    }

    Some(map)
}

/// Parse VLESS link: `vless://uuid@host:port?query#name`
fn parse_vless_link(link: &str) -> Option<Mapping> {
    let parsed = Url::parse(link).ok()?;
    let uuid = decode_percent(parsed.username());
    let server = parsed.host_str()?.to_string();
    let port = parsed.port()?;
    let name = parsed
        .fragment()
        .map(decode_percent)
        .unwrap_or_else(|| "VLESS Node".to_string());

    let mut map = Mapping::new();
    map.insert(YamlValue::from("name"), YamlValue::from(name));
    map.insert(YamlValue::from("type"), YamlValue::from("vless"));
    map.insert(YamlValue::from("server"), YamlValue::from(server));
    map.insert(YamlValue::from("port"), YamlValue::from(port));
    map.insert(YamlValue::from("uuid"), YamlValue::from(uuid));

    let pairs: std::collections::HashMap<_, _> = parsed.query_pairs().collect();
    let net = pairs
        .get("type")
        .cloned()
        .unwrap_or_else(|| "tcp".into())
        .to_string();
    map.insert(YamlValue::from("network"), YamlValue::from(net.as_str()));

    let security = pairs.get("security").map(|s| s.as_ref()).unwrap_or("none");
    if security == "reality" {
        map.insert(YamlValue::from("tls"), YamlValue::from(true));
        let mut reality_opts = Mapping::new();
        if let Some(pbk) = pairs.get("pbk") {
            reality_opts.insert(
                YamlValue::from("public-key"),
                YamlValue::from(pbk.as_ref()),
            );
        }
        if let Some(sid) = pairs.get("sid") {
            reality_opts.insert(YamlValue::from("short-id"), YamlValue::from(sid.as_ref()));
        }
        map.insert(
            YamlValue::from("reality-opts"),
            YamlValue::Mapping(reality_opts),
        );
    } else if security == "tls" {
        map.insert(YamlValue::from("tls"), YamlValue::from(true));
    }

    if let Some(sni) = pairs.get("sni") {
        map.insert(YamlValue::from("servername"), YamlValue::from(sni.as_ref()));
    }
    if let Some(flow) = pairs.get("flow") {
        map.insert(YamlValue::from("flow"), YamlValue::from(flow.as_ref()));
    }
    if let Some(fp) = pairs.get("fp") {
        map.insert(
            YamlValue::from("client-fingerprint"),
            YamlValue::from(fp.as_ref()),
        );
    }

    if net == "ws" {
        let mut ws_opts = Mapping::new();
        if let Some(path) = pairs.get("path") {
            ws_opts.insert(YamlValue::from("path"), YamlValue::from(path.as_ref()));
        }
        if let Some(host) = pairs.get("host") {
            let mut headers = Mapping::new();
            headers.insert(YamlValue::from("Host"), YamlValue::from(host.as_ref()));
            ws_opts.insert(YamlValue::from("headers"), YamlValue::Mapping(headers));
        }
        map.insert(YamlValue::from("ws-opts"), YamlValue::Mapping(ws_opts));
    } else if net == "grpc" {
        let mut grpc_opts = Mapping::new();
        if let Some(srv) = pairs.get("serviceName").or_else(|| pairs.get("path")) {
            grpc_opts.insert(
                YamlValue::from("grpc-service-name"),
                YamlValue::from(srv.as_ref()),
            );
        }
        map.insert(YamlValue::from("grpc-opts"), YamlValue::Mapping(grpc_opts));
    }

    Some(map)
}

/// Parse Trojan link: `trojan://password@host:port?query#name`
fn parse_trojan_link(link: &str) -> Option<Mapping> {
    let parsed = Url::parse(link).ok()?;
    let password = decode_percent(parsed.username());
    let server = parsed.host_str()?.to_string();
    let port = parsed.port()?;
    let name = parsed
        .fragment()
        .map(decode_percent)
        .unwrap_or_else(|| "Trojan Node".to_string());

    let mut map = Mapping::new();
    map.insert(YamlValue::from("name"), YamlValue::from(name));
    map.insert(YamlValue::from("type"), YamlValue::from("trojan"));
    map.insert(YamlValue::from("server"), YamlValue::from(server));
    map.insert(YamlValue::from("port"), YamlValue::from(port));
    map.insert(YamlValue::from("password"), YamlValue::from(password));

    let pairs: std::collections::HashMap<_, _> = parsed.query_pairs().collect();
    if let Some(sni) = pairs.get("sni").or_else(|| pairs.get("peer")) {
        map.insert(YamlValue::from("sni"), YamlValue::from(sni.as_ref()));
    }

    let net = pairs.get("type").map(|s| s.as_ref()).unwrap_or("tcp");
    map.insert(YamlValue::from("network"), YamlValue::from(net));

    if net == "ws" {
        let mut ws_opts = Mapping::new();
        if let Some(path) = pairs.get("path") {
            ws_opts.insert(YamlValue::from("path"), YamlValue::from(path.as_ref()));
        }
        if let Some(host) = pairs.get("host") {
            let mut headers = Mapping::new();
            headers.insert(YamlValue::from("Host"), YamlValue::from(host.as_ref()));
            ws_opts.insert(YamlValue::from("headers"), YamlValue::Mapping(headers));
        }
        map.insert(YamlValue::from("ws-opts"), YamlValue::Mapping(ws_opts));
    }

    Some(map)
}

/// Parse Hysteria2 link: `hysteria2://password@host:port?query#name` or `hy2://`
fn parse_hysteria2_link(link: &str) -> Option<Mapping> {
    let normalized = if link.starts_with("hy2://") {
        format!("hysteria2://{}", &link[6..])
    } else {
        link.to_string()
    };

    let parsed = Url::parse(&normalized).ok()?;
    let password = decode_percent(parsed.username());
    let server = parsed.host_str()?.to_string();
    let port = parsed.port().unwrap_or(443);
    let name = parsed
        .fragment()
        .map(decode_percent)
        .unwrap_or_else(|| "Hysteria2 Node".to_string());

    let mut map = Mapping::new();
    map.insert(YamlValue::from("name"), YamlValue::from(name));
    map.insert(YamlValue::from("type"), YamlValue::from("hysteria2"));
    map.insert(YamlValue::from("server"), YamlValue::from(server));
    map.insert(YamlValue::from("port"), YamlValue::from(port));
    map.insert(YamlValue::from("password"), YamlValue::from(password));

    let pairs: std::collections::HashMap<_, _> = parsed.query_pairs().collect();
    if let Some(sni) = pairs.get("sni") {
        map.insert(YamlValue::from("sni"), YamlValue::from(sni.as_ref()));
    }
    if let Some(insecure) = pairs.get("insecure") {
        map.insert(
            YamlValue::from("skip-cert-verify"),
            YamlValue::from(insecure == "1" || insecure == "true"),
        );
    }
    if let Some(obfs) = pairs.get("obfs") {
        map.insert(YamlValue::from("obfs"), YamlValue::from(obfs.as_ref()));
    }
    if let Some(obfs_pwd) = pairs.get("obfs-password") {
        map.insert(
            YamlValue::from("obfs-password"),
            YamlValue::from(obfs_pwd.as_ref()),
        );
    }

    Some(map)
}

/// Parse TUIC link: `tuic://uuid:password@host:port?query#name`
fn parse_tuic_link(link: &str) -> Option<Mapping> {
    let parsed = Url::parse(link).ok()?;
    let uuid = decode_percent(parsed.username());
    let password = decode_percent(parsed.password().unwrap_or(""));
    let server = parsed.host_str()?.to_string();
    let port = parsed.port().unwrap_or(443);
    let name = parsed
        .fragment()
        .map(decode_percent)
        .unwrap_or_else(|| "TUIC Node".to_string());

    let mut map = Mapping::new();
    map.insert(YamlValue::from("name"), YamlValue::from(name));
    map.insert(YamlValue::from("type"), YamlValue::from("tuic"));
    map.insert(YamlValue::from("server"), YamlValue::from(server));
    map.insert(YamlValue::from("port"), YamlValue::from(port));
    map.insert(YamlValue::from("uuid"), YamlValue::from(uuid));
    map.insert(YamlValue::from("password"), YamlValue::from(password));

    let pairs: std::collections::HashMap<_, _> = parsed.query_pairs().collect();
    if let Some(sni) = pairs.get("sni") {
        map.insert(YamlValue::from("sni"), YamlValue::from(sni.as_ref()));
    }
    if let Some(cc) = pairs.get("congestion_control") {
        map.insert(
            YamlValue::from("congestion-controller"),
            YamlValue::from(cc.as_ref()),
        );
    }

    Some(map)
}

/// Parse single proxy line / link
fn parse_proxy_line(line: &str) -> Option<Mapping> {
    let line = line.trim();
    if line.is_empty() || line.starts_with('#') || line.starts_with(';') {
        return None;
    }

    if line.starts_with("ss://") {
        return parse_ss_link(line);
    }
    if line.starts_with("ssr://") {
        return parse_ssr_link(line);
    }
    if line.starts_with("vmess://") {
        return parse_vmess_link(line);
    }
    if line.starts_with("vless://") {
        return parse_vless_link(line);
    }
    if line.starts_with("trojan://") {
        return parse_trojan_link(line);
    }
    if line.starts_with("hysteria2://") || line.starts_with("hy2://") {
        return parse_hysteria2_link(line);
    }
    if line.starts_with("tuic://") {
        return parse_tuic_link(line);
    }

    None
}

/// Parse multiple node links or base64 text into a list of proxy mappings
pub fn parse_proxies_from_raw_content(content: &str) -> Vec<Mapping> {
    let decoded = try_decode_base64(content).unwrap_or_else(|| content.to_string());
    let mut proxies = Vec::new();
    let mut names = HashSet::new();

    for raw_line in decoded.lines() {
        for segment in raw_line.split('|') {
            let segment = segment.trim();
            if let Some(mut proxy) = parse_proxy_line(segment) {
                // Ensure unique name
                let base_name = proxy
                    .get(&YamlValue::from("name"))
                    .and_then(|v| v.as_str())
                    .unwrap_or("Proxy")
                    .to_string();

                let mut unique_name = base_name.clone();
                let mut counter = 2;
                while names.contains(&unique_name) {
                    unique_name = format!("{base_name} ({counter})");
                    counter += 1;
                }
                names.insert(unique_name.clone());
                proxy.insert(
                    YamlValue::from("name"),
                    YamlValue::from(unique_name),
                );

                proxies.push(proxy);
            }
        }
    }

    proxies
}

/// Converts non-clash subscription content into a standard Clash YAML configuration.
/// If the content is already valid Clash YAML, returns it unmodified.
pub fn convert_to_clash_yaml_if_needed(content: &str) -> Result<String> {
    if is_clash_yaml(content) {
        return Ok(content.to_string());
    }

    let proxies = parse_proxies_from_raw_content(content);
    if proxies.is_empty() {
        bail!("No proxy nodes could be converted from the provided content");
    }

    let mut proxy_names = Vec::new();
    for p in &proxies {
        if let Some(name) = p.get(&YamlValue::from("name")).and_then(|v| v.as_str()) {
            proxy_names.push(name.to_string());
        }
    }

    let mut root = Mapping::new();
    root.insert(YamlValue::from("mixed-port"), YamlValue::from(7897));
    root.insert(YamlValue::from("allow-lan"), YamlValue::from(true));
    root.insert(YamlValue::from("mode"), YamlValue::from("rule"));
    root.insert(YamlValue::from("log-level"), YamlValue::from("info"));

    // Proxies
    let proxies_val: Vec<YamlValue> = proxies.into_iter().map(YamlValue::Mapping).collect();
    root.insert(YamlValue::from("proxies"), YamlValue::Sequence(proxies_val));

    // Proxy Groups
    let mut groups = Vec::new();

    // Group 1: 节点选择 (Select)
    let mut select_group = Mapping::new();
    select_group.insert(YamlValue::from("name"), YamlValue::from("节点选择"));
    select_group.insert(YamlValue::from("type"), YamlValue::from("select"));
    let mut select_proxies = vec![
        YamlValue::from("自动选择"),
    ];
    for name in &proxy_names {
        select_proxies.push(YamlValue::from(name.as_str()));
    }
    select_proxies.push(YamlValue::from("DIRECT"));
    select_group.insert(
        YamlValue::from("proxies"),
        YamlValue::Sequence(select_proxies),
    );
    groups.push(YamlValue::Mapping(select_group));

    // Group 2: 自动选择 (URL-Test)
    let mut auto_group = Mapping::new();
    auto_group.insert(YamlValue::from("name"), YamlValue::from("自动选择"));
    auto_group.insert(YamlValue::from("type"), YamlValue::from("url-test"));
    auto_group.insert(
        YamlValue::from("url"),
        YamlValue::from("https://www.gstatic.com/generate_204"),
    );
    auto_group.insert(YamlValue::from("interval"), YamlValue::from(300));
    let auto_proxies: Vec<YamlValue> = proxy_names
        .iter()
        .map(|n| YamlValue::from(n.as_str()))
        .collect();
    auto_group.insert(YamlValue::from("proxies"), YamlValue::Sequence(auto_proxies));
    groups.push(YamlValue::Mapping(auto_group));

    root.insert(YamlValue::from("proxy-groups"), YamlValue::Sequence(groups));

    // Rules
    let rules = vec![
        YamlValue::from("GEOIP,LAN,DIRECT,no-resolve"),
        YamlValue::from("GEOIP,CN,DIRECT"),
        YamlValue::from("MATCH,节点选择"),
    ];
    root.insert(YamlValue::from("rules"), YamlValue::Sequence(rules));

    serde_yaml_ng::to_string(&root).context("Failed to serialize converted Clash YAML")
}
