var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// ../../node_modules/peggy/lib/grammar-location.js
var require_grammar_location = __commonJS({
  "../../node_modules/peggy/lib/grammar-location.js"(exports2, module2) {
    "use strict";
    var GrammarLocation = class {
      /**
       * Create an instance.
       *
       * @param {any} source The original grammarSource.  Should be a string or
       *   have a toString() method.
       * @param {import("./peg").Location} start The starting offset for the
       *   grammar in the larger file.
       */
      constructor(source, start) {
        this.source = source;
        this.start = start;
      }
      /**
       * Coerce to a string.
       *
       * @returns {string} The source, stringified.
       */
      toString() {
        return String(this.source);
      }
      /**
       * Return a new Location offset from the given location by the start of the
       * grammar.
       *
       * @param {import("./peg").Location} loc The location as if the start of the
       *   grammar was the start of the file.
       * @returns {import("./peg").Location} The offset location.
       */
      offset(loc) {
        return {
          line: loc.line + this.start.line - 1,
          column: loc.line === 1 ? loc.column + this.start.column - 1 : loc.column,
          offset: loc.offset + this.start.offset
        };
      }
      /**
       * If the range has a grammarSource that is a GrammarLocation, offset the
       * start of that range by the GrammarLocation.
       *
       * @param {import("./peg").LocationRange} range The range to extract from.
       * @returns {import("./peg").Location} The offset start if possible, or the
       *   original start.
       */
      static offsetStart(range) {
        if (range.source && typeof range.source.offset === "function") {
          return range.source.offset(range.start);
        }
        return range.start;
      }
      /**
       * If the range has a grammarSource that is a GrammarLocation, offset the
       * end of that range by the GrammarLocation.
       *
       * @param {import("./peg").LocationRange} range The range to extract from.
       * @returns {import("./peg").Location} The offset end if possible, or the
       *   original end.
       */
      static offsetEnd(range) {
        if (range.source && typeof range.source.offset === "function") {
          return range.source.offset(range.end);
        }
        return range.end;
      }
    };
    module2.exports = GrammarLocation;
  }
});

// ../../node_modules/peggy/lib/grammar-error.js
var require_grammar_error = __commonJS({
  "../../node_modules/peggy/lib/grammar-error.js"(exports2, module2) {
    "use strict";
    var GrammarLocation = require_grammar_location();
    var GrammarError = class extends SyntaxError {
      /**
       *
       * @param {string} message
       * @param {PEG.LocationRange} [location]
       * @param {PEG.DiagnosticNote[]} [diagnostics]
       */
      constructor(message, location, diagnostics) {
        super(message);
        this.name = "GrammarError";
        this.location = location;
        if (diagnostics === void 0) {
          diagnostics = [];
        }
        this.diagnostics = diagnostics;
        this.stage = null;
        this.problems = [
          /** @type {PEG.Problem} */
          ["error", message, location, diagnostics]
        ];
      }
      toString() {
        let str2 = super.toString();
        if (this.location) {
          str2 += "\n at ";
          if (this.location.source !== void 0 && this.location.source !== null) {
            str2 += `${this.location.source}:`;
          }
          str2 += `${this.location.start.line}:${this.location.start.column}`;
        }
        for (const diag of this.diagnostics) {
          str2 += "\n from ";
          if (diag.location.source !== void 0 && diag.location.source !== null) {
            str2 += `${diag.location.source}:`;
          }
          str2 += `${diag.location.start.line}:${diag.location.start.column}: ${diag.message}`;
        }
        return str2;
      }
      /**
       * Format the error with associated sources.  The `location.source` should have
       * a `toString()` representation in order the result to look nice. If source
       * is `null` or `undefined`, it is skipped from the output
       *
       * Sample output:
       * ```
       * Error: Label "head" is already defined
       *  --> examples/arithmetics.pegjs:15:17
       *    |
       * 15 |   = head:Factor head:(_ ("*" / "/") _ Factor)* {
       *    |                 ^^^^
       * note: Original label location
       *  --> examples/arithmetics.pegjs:15:5
       *    |
       * 15 |   = head:Factor head:(_ ("*" / "/") _ Factor)* {
       *    |     ^^^^
       * ```
       *
       * @param {import("./peg").SourceText[]} sources mapping from location source to source text
       *
       * @returns {string} the formatted error
       */
      format(sources) {
        const srcLines = sources.map(({ source, text }) => ({
          source,
          text: text !== null && text !== void 0 ? String(text).split(/\r\n|\n|\r/g) : []
        }));
        function entry(location, indent, message = "") {
          let str2 = "";
          const src = srcLines.find(({ source }) => source === location.source);
          const s = location.start;
          const offset_s = GrammarLocation.offsetStart(location);
          if (src) {
            const e = location.end;
            const line = src.text[s.line - 1];
            const last = s.line === e.line ? e.column : line.length + 1;
            const hatLen = last - s.column || 1;
            if (message) {
              str2 += `
note: ${message}`;
            }
            str2 += `
 --> ${location.source}:${offset_s.line}:${offset_s.column}
${"".padEnd(indent)} |
${offset_s.line.toString().padStart(indent)} | ${line}
${"".padEnd(indent)} | ${"".padEnd(s.column - 1)}${"".padEnd(hatLen, "^")}`;
          } else {
            str2 += `
 at ${location.source}:${offset_s.line}:${offset_s.column}`;
            if (message) {
              str2 += `: ${message}`;
            }
          }
          return str2;
        }
        function formatProblem(severity, message, location, diagnostics = []) {
          let maxLine = -Infinity;
          if (location) {
            maxLine = diagnostics.reduce(
              (t, { location: location2 }) => Math.max(
                t,
                GrammarLocation.offsetStart(location2).line
              ),
              location.start.line
            );
          } else {
            maxLine = Math.max.apply(
              null,
              diagnostics.map((d) => d.location.start.line)
            );
          }
          maxLine = maxLine.toString().length;
          let str2 = `${severity}: ${message}`;
          if (location) {
            str2 += entry(location, maxLine);
          }
          for (const diag of diagnostics) {
            str2 += entry(diag.location, maxLine, diag.message);
          }
          return str2;
        }
        return this.problems.filter((p) => p[0] !== "info").map((p) => formatProblem(...p)).join("\n\n");
      }
    };
    module2.exports = GrammarError;
  }
});

// ../../node_modules/peggy/lib/compiler/visitor.js
var require_visitor = __commonJS({
  "../../node_modules/peggy/lib/compiler/visitor.js"(exports2, module2) {
    "use strict";
    var visitor2 = {
      build(functions) {
        function visit(node, ...args) {
          return functions[node.type](node, ...args);
        }
        function visitNop() {
        }
        function visitExpression(node, ...args) {
          return visit(node.expression, ...args);
        }
        function visitChildren(property) {
          return function(node, ...args) {
            node[property].forEach((child) => visit(child, ...args));
          };
        }
        const DEFAULT_FUNCTIONS = {
          grammar(node, ...args) {
            for (const imp of node.imports) {
              visit(imp, ...args);
            }
            if (node.topLevelInitializer) {
              if (Array.isArray(node.topLevelInitializer)) {
                for (const tli of node.topLevelInitializer) {
                  visit(tli, ...args);
                }
              } else {
                visit(node.topLevelInitializer, ...args);
              }
            }
            if (node.initializer) {
              if (Array.isArray(node.initializer)) {
                for (const init of node.initializer) {
                  visit(init, ...args);
                }
              } else {
                visit(node.initializer, ...args);
              }
            }
            node.rules.forEach((rule) => visit(rule, ...args));
          },
          grammar_import: visitNop,
          top_level_initializer: visitNop,
          initializer: visitNop,
          rule: visitExpression,
          named: visitExpression,
          choice: visitChildren("alternatives"),
          action: visitExpression,
          sequence: visitChildren("elements"),
          labeled: visitExpression,
          text: visitExpression,
          simple_and: visitExpression,
          simple_not: visitExpression,
          optional: visitExpression,
          zero_or_more: visitExpression,
          one_or_more: visitExpression,
          repeated(node, ...args) {
            if (node.delimiter) {
              visit(node.delimiter, ...args);
            }
            return visit(node.expression, ...args);
          },
          group: visitExpression,
          semantic_and: visitNop,
          semantic_not: visitNop,
          rule_ref: visitNop,
          library_ref: visitNop,
          literal: visitNop,
          class: visitNop,
          any: visitNop
        };
        Object.keys(DEFAULT_FUNCTIONS).forEach((type2) => {
          if (!Object.prototype.hasOwnProperty.call(functions, type2)) {
            functions[type2] = DEFAULT_FUNCTIONS[type2];
          }
        });
        return visit;
      }
    };
    module2.exports = visitor2;
  }
});

// ../../node_modules/peggy/lib/compiler/asts.js
var require_asts = __commonJS({
  "../../node_modules/peggy/lib/compiler/asts.js"(exports2, module2) {
    "use strict";
    var visitor2 = require_visitor();
    function combinePossibleArrays(a, b) {
      if (!(a && b)) {
        return a || b;
      }
      const aa = Array.isArray(a) ? a : [a];
      aa.push(b);
      return aa;
    }
    var asts = {
      /**
       * Find the rule with the given name, if it exists.
       *
       * @param {PEG.ast.Grammar} ast
       * @param {string} name
       * @returns {PEG.ast.Rule | undefined}
       */
      findRule(ast2, name) {
        for (let i = 0; i < ast2.rules.length; i++) {
          if (ast2.rules[i].name === name) {
            return ast2.rules[i];
          }
        }
        return void 0;
      },
      /**
       * Find the index of the rule with the given name, if it exists.
       * Otherwise returns -1.
       *
       * @param {PEG.ast.Grammar} ast
       * @param {string} name
       * @returns {number}
       */
      indexOfRule(ast2, name) {
        for (let i = 0; i < ast2.rules.length; i++) {
          if (ast2.rules[i].name === name) {
            return i;
          }
        }
        return -1;
      },
      alwaysConsumesOnSuccess(ast2, node) {
        function consumesTrue() {
          return true;
        }
        function consumesFalse() {
          return false;
        }
        const consumes = visitor2.build({
          choice(node2) {
            return node2.alternatives.every(consumes);
          },
          sequence(node2) {
            return node2.elements.some(consumes);
          },
          simple_and: consumesFalse,
          simple_not: consumesFalse,
          optional: consumesFalse,
          zero_or_more: consumesFalse,
          repeated(node2) {
            const min = node2.min ? node2.min : node2.max;
            if (min.type !== "constant" || min.value === 0) {
              return false;
            }
            if (consumes(node2.expression)) {
              return true;
            }
            if (min.value > 1 && node2.delimiter && consumes(node2.delimiter)) {
              return true;
            }
            return false;
          },
          semantic_and: consumesFalse,
          semantic_not: consumesFalse,
          rule_ref(node2) {
            const rule = asts.findRule(ast2, node2.name);
            return rule ? consumes(rule) : void 0;
          },
          // No way to know for external rules.
          library_ref: consumesFalse,
          literal(node2) {
            return node2.value !== "";
          },
          class: consumesTrue,
          any: consumesTrue
        });
        return consumes(node);
      },
      combine(asts2) {
        return asts2.reduce((combined, ast2) => {
          combined.topLevelInitializer = combinePossibleArrays(
            combined.topLevelInitializer,
            ast2.topLevelInitializer
          );
          combined.initializer = combinePossibleArrays(
            combined.initializer,
            ast2.initializer
          );
          combined.rules = combined.rules.concat(ast2.rules);
          return combined;
        });
      }
    };
    module2.exports = asts;
  }
});

// ../../node_modules/peggy/lib/compiler/passes/add-imported-rules.js
var require_add_imported_rules = __commonJS({
  "../../node_modules/peggy/lib/compiler/passes/add-imported-rules.js"(exports2, module2) {
    "use strict";
    function addImportedRules2(ast2) {
      let libraryNumber = 0;
      for (const imp of ast2.imports) {
        for (const what of imp.what) {
          let original = void 0;
          switch (what.type) {
            case "import_binding_all":
              continue;
            case "import_binding_default":
              break;
            case "import_binding":
              original = what.binding;
              break;
            case "import_binding_rename":
              original = what.rename;
              break;
            default:
              throw new TypeError("Unknown binding type");
          }
          ast2.rules.push({
            type: "rule",
            name: what.binding,
            nameLocation: what.location,
            expression: {
              type: "library_ref",
              name: original,
              library: imp.from.module,
              libraryNumber,
              location: what.location
            },
            location: imp.from.location
          });
        }
        libraryNumber++;
      }
    }
    module2.exports = addImportedRules2;
  }
});

// ../../node_modules/peggy/lib/compiler/passes/fix-library-numbers.js
var require_fix_library_numbers = __commonJS({
  "../../node_modules/peggy/lib/compiler/passes/fix-library-numbers.js"(exports2, module2) {
    "use strict";
    var visitor2 = require_visitor();
    function findLibraryNumber(ast2, name) {
      let libraryNumber = 0;
      for (const imp of ast2.imports) {
        for (const what of imp.what) {
          if (what.type === "import_binding_all" && what.binding === name) {
            return libraryNumber;
          }
        }
        libraryNumber++;
      }
      return -1;
    }
    function fixLibraryNumbers2(ast2, _options, session2) {
      const check = visitor2.build({
        library_ref(node) {
          if (node.libraryNumber === -1) {
            node.libraryNumber = findLibraryNumber(ast2, node.library);
            if (node.libraryNumber === -1) {
              session2.error(
                `Unknown module "${node.library}"`,
                node.location
              );
            }
          }
        }
      });
      check(ast2);
    }
    module2.exports = fixLibraryNumbers2;
  }
});

// ../../node_modules/peggy/lib/compiler/opcodes.js
var require_opcodes = __commonJS({
  "../../node_modules/peggy/lib/compiler/opcodes.js"(exports2, module2) {
    "use strict";
    var opcodes = {
      // Stack Manipulation
      /** @deprecated Unused */
      PUSH: 0,
      // PUSH c
      PUSH_EMPTY_STRING: 35,
      // PUSH_EMPTY_STRING
      PUSH_UNDEFINED: 1,
      // PUSH_UNDEFINED
      PUSH_NULL: 2,
      // PUSH_NULL
      PUSH_FAILED: 3,
      // PUSH_FAILED
      PUSH_EMPTY_ARRAY: 4,
      // PUSH_EMPTY_ARRAY
      PUSH_CURR_POS: 5,
      // PUSH_CURR_POS
      POP: 6,
      // POP
      POP_CURR_POS: 7,
      // POP_CURR_POS
      POP_N: 8,
      // POP_N n
      NIP: 9,
      // NIP
      APPEND: 10,
      // APPEND
      WRAP: 11,
      // WRAP n
      TEXT: 12,
      // TEXT
      PLUCK: 36,
      // PLUCK n, k, p1, ..., pK
      // Conditions and Loops
      IF: 13,
      // IF t, f
      IF_ERROR: 14,
      // IF_ERROR t, f
      IF_NOT_ERROR: 15,
      // IF_NOT_ERROR t, f
      IF_LT: 30,
      // IF_LT min, t, f
      IF_GE: 31,
      // IF_GE max, t, f
      IF_LT_DYNAMIC: 32,
      // IF_LT_DYNAMIC min, t, f
      IF_GE_DYNAMIC: 33,
      // IF_GE_DYNAMIC max, t, f
      WHILE_NOT_ERROR: 16,
      // WHILE_NOT_ERROR b
      // Matching
      MATCH_ANY: 17,
      // MATCH_ANY a, f, ...
      MATCH_STRING: 18,
      // MATCH_STRING s, a, f, ...
      MATCH_STRING_IC: 19,
      // MATCH_STRING_IC s, a, f, ...
      MATCH_CHAR_CLASS: 20,
      // MATCH_CHAR_CLASS c, a, f, ...
      MATCH_UNICODE_CLASS: 42,
      // MATCH_UNICODE_CLASS c, a, f, ...
      /** @deprecated Replaced with `MATCH_CHAR_CLASS` */
      MATCH_REGEXP: 20,
      // MATCH_REGEXP r, a, f, ...
      ACCEPT_N: 21,
      // ACCEPT_N n
      ACCEPT_STRING: 22,
      // ACCEPT_STRING s
      FAIL: 23,
      // FAIL e
      // Calls
      LOAD_SAVED_POS: 24,
      // LOAD_SAVED_POS p
      UPDATE_SAVED_POS: 25,
      // UPDATE_SAVED_POS
      CALL: 26,
      // CALL f, n, pc, p1, p2, ..., pN
      // Rules
      RULE: 27,
      // RULE r
      LIBRARY_RULE: 41,
      // LIBRARY_RULE moduleIndex, whatIndex
      // Failure Reporting
      SILENT_FAILS_ON: 28,
      // SILENT_FAILS_ON
      SILENT_FAILS_OFF: 29,
      // SILENT_FAILS_OFF
      // Because the tests have hard-coded opcode numbers, don't renumber
      // existing opcodes.  New opcodes that have been put in the correct
      // sections above are repeated here in order to ensure we don't
      // reuse them.
      //
      // IF_LT: 30
      // IF_GE: 31
      // IF_LT_DYNAMIC: 32
      // IF_GE_DYNAMIC: 33
      // 34 reserved for @mingun
      // PUSH_EMPTY_STRING: 35
      // PLUCK: 36
      SOURCE_MAP_PUSH: 37,
      // SOURCE_MAP_PUSH loc-index
      SOURCE_MAP_POP: 38,
      // SOURCE_MAP_POP
      SOURCE_MAP_LABEL_PUSH: 39,
      // SOURCE_MAP_LABEL_PUSH sp, literal-index, loc-index
      SOURCE_MAP_LABEL_POP: 40
      // SOURCE_MAP_LABEL_POP sp
      // LIBRARY_RULE:         41,
      // MATCH_UNICODE_CLASS:  42,
    };
    module2.exports = opcodes;
  }
});

// ../../node_modules/peggy/lib/compiler/intern.js
var require_intern = __commonJS({
  "../../node_modules/peggy/lib/compiler/intern.js"(exports2, module2) {
    "use strict";
    var Intern = class {
      /**
       * @typedef {object} InternOptions
       * @property {(input: V) => string} [stringify=String] Represent the
       *   converted input as a string, for value comparison.
       * @property {(input: T) => V} [convert=(x) => x] Convert the input to its
       *   stored form.  Required if type V is not the same as type T.  Return
       *   falsy value to have this input not be added; add() will return -1 in
       *   this case.
       */
      /**
       * @param {InternOptions} [options]
       */
      constructor(options2) {
        this.options = {
          stringify: String,
          convert: (x) => (
            /** @type {V} */
            /** @type {unknown} */
            x
          ),
          ...options2
        };
        this.items = [];
        this.offsets = /* @__PURE__ */ Object.create(null);
      }
      /**
       * Intern an item, getting it's asssociated number.  Returns -1 for falsy
       * inputs. O(1) with constants tied to the convert and stringify options.
       *
       * @param {T} input
       * @return {number}
       */
      add(input) {
        const c = this.options.convert(input);
        if (!c) {
          return -1;
        }
        const s = this.options.stringify(c);
        let num = this.offsets[s];
        if (num === void 0) {
          num = this.items.push(c) - 1;
          this.offsets[s] = num;
        }
        return num;
      }
      /**
       * @param {number} i
       * @returns {V}
       */
      get(i) {
        return this.items[i];
      }
      /**
       * @template U
       * @param {(value: V, index: number, array: V[]) => U} fn
       * @returns {U[]}
       */
      map(fn) {
        return this.items.map(fn);
      }
    };
    module2.exports = Intern;
  }
});

// ../../node_modules/peggy/lib/compiler/passes/inference-match-result.js
var require_inference_match_result = __commonJS({
  "../../node_modules/peggy/lib/compiler/passes/inference-match-result.js"(exports2, module2) {
    "use strict";
    var visitor2 = require_visitor();
    var asts = require_asts();
    var GrammarError = require_grammar_error();
    var ALWAYS_MATCH = 1;
    var SOMETIMES_MATCH = 0;
    var NEVER_MATCH = -1;
    function inferenceMatchResult2(ast2) {
      function sometimesMatch(node) {
        return node.match = SOMETIMES_MATCH;
      }
      function alwaysMatch(node) {
        inference(node.expression);
        return node.match = ALWAYS_MATCH;
      }
      function inferenceExpression(node) {
        return node.match = inference(node.expression);
      }
      function inferenceElements(elements, forChoice) {
        const length = elements.length;
        let always = 0;
        let never = 0;
        for (let i = 0; i < length; ++i) {
          const result = inference(elements[i]);
          if (result === ALWAYS_MATCH) {
            ++always;
          }
          if (result === NEVER_MATCH) {
            ++never;
          }
        }
        if (always === length) {
          return ALWAYS_MATCH;
        }
        if (forChoice) {
          return never === length ? NEVER_MATCH : SOMETIMES_MATCH;
        }
        return never > 0 ? NEVER_MATCH : SOMETIMES_MATCH;
      }
      const inference = visitor2.build({
        rule(node) {
          let oldResult;
          let count = 0;
          if (typeof node.match === "undefined") {
            node.match = SOMETIMES_MATCH;
            do {
              oldResult = node.match;
              node.match = inference(node.expression);
              if (++count > 6) {
                throw new GrammarError(
                  "Infinity cycle detected when trying to evaluate node match result",
                  node.location
                );
              }
            } while (oldResult !== node.match);
          }
          return node.match;
        },
        named: inferenceExpression,
        choice(node) {
          return node.match = inferenceElements(node.alternatives, true);
        },
        action: inferenceExpression,
        sequence(node) {
          return node.match = inferenceElements(node.elements, false);
        },
        labeled: inferenceExpression,
        text: inferenceExpression,
        simple_and: inferenceExpression,
        simple_not(node) {
          return node.match = -inference(node.expression);
        },
        optional: alwaysMatch,
        zero_or_more: alwaysMatch,
        one_or_more: inferenceExpression,
        repeated(node) {
          const match = inference(node.expression);
          const dMatch = node.delimiter ? inference(node.delimiter) : NEVER_MATCH;
          const min = node.min ? node.min : node.max;
          if (min.type !== "constant" || node.max.type !== "constant") {
            return node.match = SOMETIMES_MATCH;
          }
          if (node.max.value === 0 || node.max.value !== null && min.value > node.max.value) {
            return node.match = NEVER_MATCH;
          }
          if (match === NEVER_MATCH) {
            return node.match = min.value === 0 ? ALWAYS_MATCH : NEVER_MATCH;
          }
          if (match === ALWAYS_MATCH) {
            if (node.delimiter && min.value >= 2) {
              return node.match = dMatch;
            }
            return node.match = ALWAYS_MATCH;
          }
          if (node.delimiter && min.value >= 2) {
            return (
              // If a delimiter never match then the range also never match (because
              // there at least one delimiter)
              node.match = dMatch === NEVER_MATCH ? NEVER_MATCH : SOMETIMES_MATCH
            );
          }
          return node.match = min.value === 0 ? ALWAYS_MATCH : SOMETIMES_MATCH;
        },
        group: inferenceExpression,
        semantic_and: sometimesMatch,
        semantic_not: sometimesMatch,
        rule_ref(node) {
          const rule = asts.findRule(ast2, node.name);
          if (!rule) {
            return SOMETIMES_MATCH;
          }
          return node.match = inference(rule);
        },
        library_ref() {
          return 0;
        },
        literal(node) {
          const match = node.value.length === 0 ? ALWAYS_MATCH : SOMETIMES_MATCH;
          return node.match = match;
        },
        class(node) {
          const match = node.parts.length === 0 ? NEVER_MATCH : SOMETIMES_MATCH;
          return node.match = match;
        },
        // |any| not match on empty input
        any: sometimesMatch
      });
      inference(ast2);
    }
    inferenceMatchResult2.ALWAYS_MATCH = ALWAYS_MATCH;
    inferenceMatchResult2.SOMETIMES_MATCH = SOMETIMES_MATCH;
    inferenceMatchResult2.NEVER_MATCH = NEVER_MATCH;
    module2.exports = inferenceMatchResult2;
  }
});

// ../../node_modules/peggy/lib/compiler/passes/generate-bytecode.js
var require_generate_bytecode = __commonJS({
  "../../node_modules/peggy/lib/compiler/passes/generate-bytecode.js"(exports2, module2) {
    "use strict";
    var asts = require_asts();
    var op = require_opcodes();
    var visitor2 = require_visitor();
    var Intern = require_intern();
    var { ALWAYS_MATCH, SOMETIMES_MATCH, NEVER_MATCH } = require_inference_match_result();
    function generateBytecode2(ast2, options2) {
      const literals = new Intern();
      const classes = new Intern({
        stringify: JSON.stringify,
        /** @type {(input: PEG.ast.CharacterClass) => PEG.ast.GrammarCharacterClass} */
        convert: (node) => ({
          value: node.parts,
          inverted: node.inverted,
          ignoreCase: node.ignoreCase,
          unicode: node.unicode
        })
      });
      const expectations = new Intern({
        stringify: JSON.stringify
      });
      const importedNames = new Intern();
      const functions = [];
      const locations = [];
      function addFunctionConst(predicate, params, node) {
        const func = {
          predicate,
          params,
          body: node.code,
          location: node.codeLocation
        };
        const pattern = JSON.stringify(func);
        const index = functions.findIndex((f) => JSON.stringify(f) === pattern);
        return index === -1 ? functions.push(func) - 1 : index;
      }
      function addLocation(location) {
        return locations.push(location) - 1;
      }
      function cloneEnv(env) {
        const clone = {};
        Object.keys(env).forEach((name) => {
          clone[name] = env[name];
        });
        return clone;
      }
      function buildSequence(first, ...args) {
        return first.concat(...args);
      }
      function buildCondition(match, condCode, thenCode, elseCode) {
        if (match === ALWAYS_MATCH) {
          return thenCode;
        }
        if (match === NEVER_MATCH) {
          return elseCode;
        }
        return condCode.concat(
          [thenCode.length, elseCode.length],
          thenCode,
          elseCode
        );
      }
      function buildLoop(condCode, bodyCode) {
        return condCode.concat([bodyCode.length], bodyCode);
      }
      function buildCall(functionIndex, delta, env, sp) {
        const params = Object.keys(env).map((name) => sp - env[name]);
        return [op.CALL, functionIndex, delta, params.length].concat(params);
      }
      function buildSimplePredicate(expression, negative, context) {
        const match = expression.match || 0;
        return buildSequence(
          [op.PUSH_CURR_POS],
          [op.SILENT_FAILS_ON],
          // eslint-disable-next-line no-use-before-define -- Mutual recursion
          generate4(expression, {
            sp: context.sp + 1,
            env: cloneEnv(context.env),
            action: null
          }),
          [op.SILENT_FAILS_OFF],
          buildCondition(
            negative ? -match : match,
            [negative ? op.IF_ERROR : op.IF_NOT_ERROR],
            buildSequence(
              [op.POP],
              [negative ? op.POP : op.POP_CURR_POS],
              [op.PUSH_UNDEFINED]
            ),
            buildSequence(
              [op.POP],
              [negative ? op.POP_CURR_POS : op.POP],
              [op.PUSH_FAILED]
            )
          )
        );
      }
      function buildSemanticPredicate(node, negative, context) {
        const functionIndex = addFunctionConst(
          true,
          Object.keys(context.env),
          node
        );
        return buildSequence(
          [op.UPDATE_SAVED_POS],
          buildCall(functionIndex, 0, context.env, context.sp),
          buildCondition(
            node.match || 0,
            [op.IF],
            buildSequence(
              [op.POP],
              negative ? [op.PUSH_FAILED] : [op.PUSH_UNDEFINED]
            ),
            buildSequence(
              [op.POP],
              negative ? [op.PUSH_UNDEFINED] : [op.PUSH_FAILED]
            )
          )
        );
      }
      function buildAppendLoop(expressionCode) {
        return buildLoop(
          [op.WHILE_NOT_ERROR],
          buildSequence([op.APPEND], expressionCode)
        );
      }
      function unknownBoundary(boundary) {
        const b = (
          /** @type {{ type: string }} */
          boundary
        );
        return new Error(`Unknown boundary type "${b.type}" for the "repeated" node`);
      }
      function buildRangeCall(boundary, env, sp, offset) {
        switch (boundary.type) {
          case "constant":
            return { pre: [], post: [], sp };
          case "variable":
            boundary.sp = offset + sp - env[boundary.value];
            return { pre: [], post: [], sp };
          case "function": {
            boundary.sp = offset;
            const functionIndex = addFunctionConst(
              true,
              Object.keys(env),
              { code: boundary.value, codeLocation: boundary.codeLocation }
            );
            return {
              pre: buildCall(functionIndex, 0, env, sp),
              post: [op.NIP],
              // +1 for the function result
              sp: sp + 1
            };
          }
          // istanbul ignore next Because we never generate invalid boundary type we cannot reach this branch
          default:
            throw unknownBoundary(boundary);
        }
      }
      function buildCheckMax(expressionCode, max) {
        if (max.value !== null) {
          const checkCode = max.type === "constant" ? [op.IF_GE, max.value] : [op.IF_GE_DYNAMIC, max.sp || 0];
          return buildCondition(
            SOMETIMES_MATCH,
            checkCode,
            // if (r.length >= max)   stack:[ [elem...] ]
            [op.PUSH_FAILED],
            //   elem = peg$FAILED;   stack:[ [elem...], peg$FAILED ]
            expressionCode
            // else
          );
        }
        return expressionCode;
      }
      function buildCheckMin(expressionCode, min) {
        const checkCode = min.type === "constant" ? [op.IF_LT, min.value] : [op.IF_LT_DYNAMIC, min.sp || 0];
        return buildSequence(
          expressionCode,
          // result = [elem...];      stack:[ pos, [elem...] ]
          buildCondition(
            SOMETIMES_MATCH,
            checkCode,
            // if (result.length < min) {
            /* eslint-disable @stylistic/indent -- Clarity */
            [
              op.POP,
              op.POP_CURR_POS,
              //   currPos = savedPos;    stack:[  ]
              op.PUSH_FAILED
            ],
            //   result = peg$FAILED;   stack:[ peg$FAILED ]
            /* eslint-enable @stylistic/indent */
            [op.NIP]
            // }                        stack:[ [elem...] ]
          )
        );
      }
      function buildRangeBody(delimiterNode, expressionMatch, expressionCode, context, offset) {
        if (delimiterNode) {
          return buildSequence(
            //                          stack:[  ]
            [op.PUSH_CURR_POS],
            // pos = peg$currPos;       stack:[ pos ]
            // eslint-disable-next-line no-use-before-define -- Mutual recursion
            generate4(delimiterNode, {
              // item = delim();          stack:[ pos, delim ]
              // +1 for the saved offset
              sp: context.sp + offset + 1,
              env: cloneEnv(context.env),
              action: null
            }),
            buildCondition(
              delimiterNode.match || 0,
              [op.IF_NOT_ERROR],
              // if (item !== peg$FAILED) {
              buildSequence(
                [op.POP],
                //                          stack:[ pos ]
                expressionCode,
                //   item = expr();         stack:[ pos, item ]
                buildCondition(
                  -expressionMatch,
                  [op.IF_ERROR],
                  //   if (item === peg$FAILED) {
                  // If element FAILED, rollback currPos to saved value.
                  /* eslint-disable @stylistic/indent -- Clarity */
                  [
                    op.POP,
                    //                          stack:[ pos ]
                    op.POP_CURR_POS,
                    //     peg$currPos = pos;   stack:[  ]
                    op.PUSH_FAILED
                  ],
                  //     item = peg$FAILED;   stack:[ peg$FAILED ]
                  /* eslint-enable @stylistic/indent */
                  // Else, just drop saved currPos.
                  [op.NIP]
                  //   }                      stack:[ item ]
                )
              ),
              // }
              // If delimiter FAILED, currPos not changed, so just drop it.
              [op.NIP]
              //                          stack:[ peg$FAILED ]
            )
            //                          stack:[ <?> ]
          );
        }
        return expressionCode;
      }
      function wrapGenerators(generators) {
        if (options2 && options2.output === "source-and-map") {
          Object.keys(generators).forEach((name) => {
            const generator = generators[name];
            generators[name] = function(node, ...args) {
              const generated = generator(node, ...args);
              if (generated === void 0 || !node.location) {
                return generated;
              }
              return buildSequence(
                [
                  op.SOURCE_MAP_PUSH,
                  addLocation(node.location)
                ],
                generated,
                [
                  op.SOURCE_MAP_POP
                ]
              );
            };
          });
        }
        return visitor2.build(generators);
      }
      const generate4 = wrapGenerators({
        grammar(node) {
          node.rules.forEach(generate4);
          node.literals = literals.items;
          node.classes = classes.items;
          node.expectations = expectations.items;
          node.importedNames = importedNames.items;
          node.functions = functions;
          node.locations = locations;
        },
        rule(node) {
          node.bytecode = generate4(node.expression, {
            sp: -1,
            // Stack pointer
            env: {},
            // Mapping of label names to stack positions
            pluck: [],
            // Fields that have been picked
            action: null
            // Action nodes pass themselves to children here
          });
        },
        named(node, context) {
          const match = node.match || 0;
          const nameIndex = match === ALWAYS_MATCH ? -1 : expectations.add({ type: "rule", value: node.name });
          return buildSequence(
            [op.SILENT_FAILS_ON],
            generate4(node.expression, context),
            [op.SILENT_FAILS_OFF],
            buildCondition(-match, [op.IF_ERROR], [op.FAIL, nameIndex], [])
          );
        },
        choice(node, context) {
          function buildAlternativesCode(alternatives, context2) {
            const match = alternatives[0].match || 0;
            const first = generate4(alternatives[0], {
              sp: context2.sp,
              env: cloneEnv(context2.env),
              action: null
            });
            if (match === ALWAYS_MATCH) {
              return first;
            }
            return buildSequence(
              first,
              alternatives.length > 1 ? buildCondition(
                SOMETIMES_MATCH,
                [op.IF_ERROR],
                buildSequence(
                  [op.POP],
                  buildAlternativesCode(alternatives.slice(1), context2)
                ),
                []
              ) : []
            );
          }
          return buildAlternativesCode(node.alternatives, context);
        },
        action(node, context) {
          const env = cloneEnv(context.env);
          const emitCall = node.expression.type !== "sequence" || node.expression.elements.length === 0;
          const expressionCode = generate4(node.expression, {
            sp: context.sp + (emitCall ? 1 : 0),
            env,
            action: node
          });
          const match = node.expression.match || 0;
          const functionIndex = emitCall && match !== NEVER_MATCH ? addFunctionConst(false, Object.keys(env), node) : -1;
          return emitCall ? buildSequence(
            [op.PUSH_CURR_POS],
            expressionCode,
            buildCondition(
              match,
              [op.IF_NOT_ERROR],
              buildSequence(
                [op.LOAD_SAVED_POS, 1],
                buildCall(functionIndex, 1, env, context.sp + 2)
              ),
              []
            ),
            [op.NIP]
          ) : expressionCode;
        },
        sequence(node, context) {
          function buildElementsCode(elements, context2) {
            if (elements.length > 0) {
              const processedCount = node.elements.length - elements.length + 1;
              return buildSequence(
                generate4(elements[0], {
                  sp: context2.sp,
                  env: context2.env,
                  pluck: context2.pluck,
                  action: null
                }),
                buildCondition(
                  elements[0].match || 0,
                  [op.IF_NOT_ERROR],
                  buildElementsCode(elements.slice(1), {
                    sp: context2.sp + 1,
                    env: context2.env,
                    pluck: context2.pluck,
                    action: context2.action
                  }),
                  buildSequence(
                    processedCount > 1 ? [op.POP_N, processedCount] : [op.POP],
                    [op.POP_CURR_POS],
                    [op.PUSH_FAILED]
                  )
                )
              );
            } else {
              if (context2.pluck && context2.pluck.length > 0) {
                return buildSequence(
                  [op.PLUCK, node.elements.length + 1, context2.pluck.length],
                  context2.pluck.map((eSP) => context2.sp - eSP)
                );
              }
              if (context2.action) {
                const functionIndex = addFunctionConst(
                  false,
                  Object.keys(context2.env),
                  context2.action
                );
                return buildSequence(
                  [op.LOAD_SAVED_POS, node.elements.length],
                  buildCall(
                    functionIndex,
                    node.elements.length + 1,
                    context2.env,
                    context2.sp
                  )
                );
              } else {
                return buildSequence([op.WRAP, node.elements.length], [op.NIP]);
              }
            }
          }
          return buildSequence(
            [op.PUSH_CURR_POS],
            buildElementsCode(node.elements, {
              sp: context.sp + 1,
              env: context.env,
              pluck: [],
              action: context.action
            })
          );
        },
        labeled(node, context) {
          let env = context.env;
          const label = node.label;
          const sp = context.sp + 1;
          if (label) {
            env = cloneEnv(context.env);
            context.env[label] = sp;
          }
          if (node.pick) {
            context.pluck.push(sp);
          }
          const expression = generate4(node.expression, {
            sp: context.sp,
            env,
            action: null
          });
          if (label && node.labelLocation && options2 && options2.output === "source-and-map") {
            return buildSequence(
              [
                op.SOURCE_MAP_LABEL_PUSH,
                sp,
                literals.add(label),
                addLocation(node.labelLocation)
              ],
              expression,
              [op.SOURCE_MAP_LABEL_POP, sp]
            );
          }
          return expression;
        },
        text(node, context) {
          return buildSequence(
            [op.PUSH_CURR_POS],
            generate4(node.expression, {
              sp: context.sp + 1,
              env: cloneEnv(context.env),
              action: null
            }),
            buildCondition(
              node.match || 0,
              [op.IF_NOT_ERROR],
              buildSequence([op.POP], [op.TEXT]),
              [op.NIP]
            )
          );
        },
        simple_and(node, context) {
          return buildSimplePredicate(node.expression, false, context);
        },
        simple_not(node, context) {
          return buildSimplePredicate(node.expression, true, context);
        },
        optional(node, context) {
          return buildSequence(
            generate4(node.expression, {
              sp: context.sp,
              env: cloneEnv(context.env),
              action: null
            }),
            buildCondition(
              // Check expression match, not the node match
              // If expression always match, no need to replace FAILED to NULL,
              // because FAILED will never appeared
              -(node.expression.match || 0),
              [op.IF_ERROR],
              buildSequence([op.POP], [op.PUSH_NULL]),
              []
            )
          );
        },
        zero_or_more(node, context) {
          const expressionCode = generate4(node.expression, {
            sp: context.sp + 1,
            env: cloneEnv(context.env),
            action: null
          });
          return buildSequence(
            [op.PUSH_EMPTY_ARRAY],
            expressionCode,
            buildAppendLoop(expressionCode),
            [op.POP]
          );
        },
        one_or_more(node, context) {
          const expressionCode = generate4(node.expression, {
            sp: context.sp + 1,
            env: cloneEnv(context.env),
            action: null
          });
          return buildSequence(
            [op.PUSH_EMPTY_ARRAY],
            expressionCode,
            buildCondition(
              // Condition depends on the expression match, not the node match
              node.expression.match || 0,
              [op.IF_NOT_ERROR],
              buildSequence(buildAppendLoop(expressionCode), [op.POP]),
              buildSequence([op.POP], [op.POP], [op.PUSH_FAILED])
            )
          );
        },
        repeated(node, context) {
          const min = node.min ? node.min : node.max;
          const hasMin = min.type !== "constant" || min.value > 0;
          const hasBoundedMax = node.max.type !== "constant" && node.max.value !== null;
          const offset = hasMin ? 2 : 1;
          const minCode = node.min ? buildRangeCall(
            node.min,
            context.env,
            context.sp,
            // +1 for the result slot with an array
            // +1 for the saved position
            // +1 if we have a "function" maximum it occupies an additional slot in the stack
            2 + (node.max.type === "function" ? 1 : 0)
          ) : { pre: [], post: [], sp: context.sp };
          const maxCode = buildRangeCall(node.max, context.env, minCode.sp, offset);
          const firstExpressionCode = generate4(node.expression, {
            sp: maxCode.sp + offset,
            env: cloneEnv(context.env),
            action: null
          });
          const expressionCode = node.delimiter !== null ? generate4(node.expression, {
            // +1 for the saved position before parsing the `delimiter elem` pair
            sp: maxCode.sp + offset + 1,
            env: cloneEnv(context.env),
            action: null
          }) : firstExpressionCode;
          const bodyCode = buildRangeBody(
            node.delimiter,
            node.expression.match || 0,
            expressionCode,
            context,
            offset
          );
          const checkMaxCode = buildCheckMax(bodyCode, node.max);
          const firstElemCode = hasBoundedMax ? buildCheckMax(firstExpressionCode, node.max) : firstExpressionCode;
          const mainLoopCode = buildSequence(
            // If the low boundary present, then backtracking is possible, so save the current pos
            hasMin ? [op.PUSH_CURR_POS] : [],
            // var savedPos = curPos;   stack:[ pos ]
            [op.PUSH_EMPTY_ARRAY],
            // var result = [];         stack:[ pos, [] ]
            firstElemCode,
            // var elem = expr();       stack:[ pos, [], elem ]
            buildAppendLoop(checkMaxCode),
            // while(...)r.push(elem);  stack:[ pos, [...], elem|peg$FAILED ]
            [op.POP]
            //                          stack:[ pos, [...] ] (pop elem===`peg$FAILED`)
          );
          return buildSequence(
            minCode.pre,
            maxCode.pre,
            // Check the low boundary, if it is defined and not |0|.
            hasMin ? buildCheckMin(mainLoopCode, min) : mainLoopCode,
            maxCode.post,
            minCode.post
          );
        },
        group(node, context) {
          return generate4(node.expression, {
            sp: context.sp,
            env: cloneEnv(context.env),
            action: null
          });
        },
        semantic_and(node, context) {
          return buildSemanticPredicate(node, false, context);
        },
        semantic_not(node, context) {
          return buildSemanticPredicate(node, true, context);
        },
        rule_ref(node) {
          return [op.RULE, asts.indexOfRule(ast2, node.name)];
        },
        library_ref(node) {
          return [
            op.LIBRARY_RULE,
            node.libraryNumber,
            importedNames.add(node.name)
          ];
        },
        literal(node) {
          if (node.value.length > 0) {
            const match = node.match || 0;
            const needConst = match === SOMETIMES_MATCH || match === ALWAYS_MATCH && !node.ignoreCase;
            const stringIndex = needConst ? literals.add(
              node.ignoreCase ? node.value.toLowerCase() : node.value
            ) : -1;
            const expectedIndex = match !== ALWAYS_MATCH ? expectations.add({
              type: "literal",
              value: node.value,
              ignoreCase: node.ignoreCase
            }) : -1;
            return buildCondition(
              match,
              node.ignoreCase ? [op.MATCH_STRING_IC, stringIndex] : [op.MATCH_STRING, stringIndex],
              node.ignoreCase ? [op.ACCEPT_N, node.value.length] : [op.ACCEPT_STRING, stringIndex],
              [op.FAIL, expectedIndex]
            );
          }
          return [op.PUSH_EMPTY_STRING];
        },
        class(node) {
          const match = node.match || 0;
          const classIndex = match === SOMETIMES_MATCH ? classes.add(node) : -1;
          const expectedIndex = match !== ALWAYS_MATCH ? expectations.add({
            type: "class",
            value: node.parts,
            inverted: node.inverted,
            ignoreCase: node.ignoreCase,
            unicode: node.unicode
          }) : -1;
          return buildCondition(
            match,
            [
              node.unicode ? op.MATCH_UNICODE_CLASS : op.MATCH_CHAR_CLASS,
              classIndex
            ],
            [op.ACCEPT_N, node.unicode ? -1 : 1],
            [op.FAIL, expectedIndex]
          );
        },
        any(node) {
          const match = node.match || 0;
          const expectedIndex = match !== ALWAYS_MATCH ? expectations.add({
            type: "any"
          }) : -1;
          return buildCondition(
            match,
            [op.MATCH_ANY],
            [op.ACCEPT_N, 1],
            [op.FAIL, expectedIndex]
          );
        }
      });
      generate4(ast2);
    }
    module2.exports = generateBytecode2;
  }
});

// ../../node_modules/source-map-generator/lib/base64.js
var require_base64 = __commonJS({
  "../../node_modules/source-map-generator/lib/base64.js"(exports2) {
    var intToCharMap = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".split("");
    exports2.encode = function(number) {
      if (0 <= number && number < intToCharMap.length) {
        return intToCharMap[number];
      }
      throw new TypeError("Must be between 0 and 63: " + number);
    };
  }
});

// ../../node_modules/source-map-generator/lib/base64-vlq.js
var require_base64_vlq = __commonJS({
  "../../node_modules/source-map-generator/lib/base64-vlq.js"(exports2) {
    var base642 = require_base64();
    var VLQ_BASE_SHIFT = 5;
    var VLQ_BASE = 1 << VLQ_BASE_SHIFT;
    var VLQ_BASE_MASK = VLQ_BASE - 1;
    var VLQ_CONTINUATION_BIT = VLQ_BASE;
    function toVLQSigned(aValue) {
      return aValue < 0 ? (-aValue << 1) + 1 : (aValue << 1) + 0;
    }
    exports2.encode = function base64VLQ_encode(aValue) {
      let encoded = "";
      let digit;
      let vlq = toVLQSigned(aValue);
      do {
        digit = vlq & VLQ_BASE_MASK;
        vlq >>>= VLQ_BASE_SHIFT;
        if (vlq > 0) {
          digit |= VLQ_CONTINUATION_BIT;
        }
        encoded += base642.encode(digit);
      } while (vlq > 0);
      return encoded;
    };
  }
});

// ../../node_modules/source-map-generator/lib/util.js
var require_util = __commonJS({
  "../../node_modules/source-map-generator/lib/util.js"(exports2) {
    function getArg(aArgs, aName, aDefaultValue) {
      if (aName in aArgs) {
        return aArgs[aName];
      } else if (arguments.length === 3) {
        return aDefaultValue;
      }
      throw new Error('"' + aName + '" is a required argument.');
    }
    exports2.getArg = getArg;
    var supportsNullProto = (function() {
      const obj = /* @__PURE__ */ Object.create(null);
      return !("__proto__" in obj);
    })();
    function identity(s) {
      return s;
    }
    function toSetString(aStr) {
      if (isProtoString(aStr)) {
        return "$" + aStr;
      }
      return aStr;
    }
    exports2.toSetString = supportsNullProto ? identity : toSetString;
    function fromSetString(aStr) {
      if (isProtoString(aStr)) {
        return aStr.slice(1);
      }
      return aStr;
    }
    exports2.fromSetString = supportsNullProto ? identity : fromSetString;
    function isProtoString(s) {
      if (!s) {
        return false;
      }
      const length = s.length;
      if (length < 9) {
        return false;
      }
      if (s.charCodeAt(length - 1) !== 95 || s.charCodeAt(length - 2) !== 95 || s.charCodeAt(length - 3) !== 111 || s.charCodeAt(length - 4) !== 116 || s.charCodeAt(length - 5) !== 111 || s.charCodeAt(length - 6) !== 114 || s.charCodeAt(length - 7) !== 112 || s.charCodeAt(length - 8) !== 95 || s.charCodeAt(length - 9) !== 95) {
        return false;
      }
      for (let i = length - 10; i >= 0; i--) {
        if (s.charCodeAt(i) !== 36) {
          return false;
        }
      }
      return true;
    }
    function strcmp(aStr1, aStr2) {
      if (aStr1 === aStr2) {
        return 0;
      }
      if (aStr1 === null) {
        return 1;
      }
      if (aStr2 === null) {
        return -1;
      }
      if (aStr1 > aStr2) {
        return 1;
      }
      return -1;
    }
    function compareByGeneratedPositionsInflated(mappingA, mappingB) {
      let cmp = mappingA.generatedLine - mappingB.generatedLine;
      if (cmp !== 0) {
        return cmp;
      }
      cmp = mappingA.generatedColumn - mappingB.generatedColumn;
      if (cmp !== 0) {
        return cmp;
      }
      cmp = strcmp(mappingA.source, mappingB.source);
      if (cmp !== 0) {
        return cmp;
      }
      cmp = mappingA.originalLine - mappingB.originalLine;
      if (cmp !== 0) {
        return cmp;
      }
      cmp = mappingA.originalColumn - mappingB.originalColumn;
      if (cmp !== 0) {
        return cmp;
      }
      return strcmp(mappingA.name, mappingB.name);
    }
    exports2.compareByGeneratedPositionsInflated = compareByGeneratedPositionsInflated;
    var PROTOCOL = "http:";
    var PROTOCOL_AND_HOST = `${PROTOCOL}//host`;
    function createSafeHandler(cb) {
      return (input) => {
        const type2 = getURLType(input);
        const base = buildSafeBase(input);
        const url = new URL(input, base);
        cb(url);
        const result = url.toString();
        if (type2 === "absolute") {
          return result;
        } else if (type2 === "scheme-relative") {
          return result.slice(PROTOCOL.length);
        } else if (type2 === "path-absolute") {
          return result.slice(PROTOCOL_AND_HOST.length);
        }
        return computeRelativeURL(base, result);
      };
    }
    function withBase(url, base) {
      return new URL(url, base).toString();
    }
    function buildUniqueSegment(prefix, str2) {
      let id = 0;
      do {
        const ident = prefix + id++;
        if (str2.indexOf(ident) === -1) return ident;
      } while (true);
    }
    function buildSafeBase(str2) {
      const maxDotParts = str2.split("..").length - 1;
      const segment = buildUniqueSegment("p", str2);
      let base = `${PROTOCOL_AND_HOST}/`;
      for (let i = 0; i < maxDotParts; i++) {
        base += `${segment}/`;
      }
      return base;
    }
    var ABSOLUTE_SCHEME = /^[A-Za-z0-9\+\-\.]+:/;
    function getURLType(url) {
      if (url[0] === "/") {
        if (url[1] === "/") return "scheme-relative";
        return "path-absolute";
      }
      return ABSOLUTE_SCHEME.test(url) ? "absolute" : "path-relative";
    }
    function computeRelativeURL(rootURL, targetURL) {
      if (typeof rootURL === "string") rootURL = new URL(rootURL);
      if (typeof targetURL === "string") targetURL = new URL(targetURL);
      const targetParts = targetURL.pathname.split("/");
      const rootParts = rootURL.pathname.split("/");
      if (rootParts.length > 0 && !rootParts[rootParts.length - 1]) {
        rootParts.pop();
      }
      while (targetParts.length > 0 && rootParts.length > 0 && targetParts[0] === rootParts[0]) {
        targetParts.shift();
        rootParts.shift();
      }
      const relativePath = rootParts.map(() => "..").concat(targetParts).join("/");
      return relativePath + targetURL.search + targetURL.hash;
    }
    var ensureDirectory = createSafeHandler((url) => {
      url.pathname = url.pathname.replace(/\/?$/, "/");
    });
    var normalize = createSafeHandler((url) => {
    });
    exports2.normalize = normalize;
    function join(aRoot, aPath) {
      const pathType = getURLType(aPath);
      const rootType = getURLType(aRoot);
      aRoot = ensureDirectory(aRoot);
      if (pathType === "absolute") {
        return withBase(aPath, void 0);
      }
      if (rootType === "absolute") {
        return withBase(aPath, aRoot);
      }
      if (pathType === "scheme-relative") {
        return normalize(aPath);
      }
      if (rootType === "scheme-relative") {
        return withBase(aPath, withBase(aRoot, PROTOCOL_AND_HOST)).slice(
          PROTOCOL.length
        );
      }
      if (pathType === "path-absolute") {
        return normalize(aPath);
      }
      if (rootType === "path-absolute") {
        return withBase(aPath, withBase(aRoot, PROTOCOL_AND_HOST)).slice(
          PROTOCOL_AND_HOST.length
        );
      }
      const base = buildSafeBase(aPath + aRoot);
      const newPath = withBase(aPath, withBase(aRoot, base));
      return computeRelativeURL(base, newPath);
    }
    exports2.join = join;
    function relative(rootURL, targetURL) {
      const result = relativeIfPossible(rootURL, targetURL);
      return typeof result === "string" ? result : normalize(targetURL);
    }
    exports2.relative = relative;
    function relativeIfPossible(rootURL, targetURL) {
      const urlType = getURLType(rootURL);
      if (urlType !== getURLType(targetURL)) {
        return null;
      }
      const base = buildSafeBase(rootURL + targetURL);
      const root = new URL(rootURL, base);
      const target = new URL(targetURL, base);
      try {
        new URL("", target.toString());
      } catch (_err) {
        return null;
      }
      if (target.protocol !== root.protocol || target.user !== root.user || target.password !== root.password || target.hostname !== root.hostname || target.port !== root.port) {
        return null;
      }
      return computeRelativeURL(root, target);
    }
  }
});

// ../../node_modules/source-map-generator/lib/array-set.js
var require_array_set = __commonJS({
  "../../node_modules/source-map-generator/lib/array-set.js"(exports2) {
    var ArraySet = class _ArraySet {
      constructor() {
        this._array = [];
        this._set = /* @__PURE__ */ new Map();
      }
      /**
       * Static method for creating ArraySet instances from an existing array.
       */
      static fromArray(aArray, aAllowDuplicates) {
        const set2 = new _ArraySet();
        for (let i = 0, len = aArray.length; i < len; i++) {
          set2.add(aArray[i], aAllowDuplicates);
        }
        return set2;
      }
      /**
       * Return how many unique items are in this ArraySet. If duplicates have been
       * added, than those do not count towards the size.
       *
       * @returns Number
       */
      size() {
        return this._set.size;
      }
      /**
       * Add the given string to this set.
       *
       * @param String aStr
       */
      add(aStr, aAllowDuplicates) {
        const isDuplicate = this.has(aStr);
        const idx = this._array.length;
        if (!isDuplicate || aAllowDuplicates) {
          this._array.push(aStr);
        }
        if (!isDuplicate) {
          this._set.set(aStr, idx);
        }
      }
      /**
       * Is the given string a member of this set?
       *
       * @param String aStr
       */
      has(aStr) {
        return this._set.has(aStr);
      }
      /**
       * What is the index of the given string in the array?
       *
       * @param String aStr
       */
      indexOf(aStr) {
        const idx = this._set.get(aStr);
        if (idx >= 0) {
          return idx;
        }
        throw new Error('"' + aStr + '" is not in the set.');
      }
      /**
       * What is the element at the given index?
       *
       * @param Number aIdx
       */
      at(aIdx) {
        if (aIdx >= 0 && aIdx < this._array.length) {
          return this._array[aIdx];
        }
        throw new Error("No element indexed by " + aIdx);
      }
      /**
       * Returns the array representation of this set (which has the proper indices
       * indicated by indexOf). Note that this is a copy of the internal array used
       * for storing the members so that no one can mess with internal state.
       */
      toArray() {
        return this._array.slice();
      }
    };
    exports2.ArraySet = ArraySet;
  }
});

// ../../node_modules/source-map-generator/lib/mapping-list.js
var require_mapping_list = __commonJS({
  "../../node_modules/source-map-generator/lib/mapping-list.js"(exports2) {
    var util = require_util();
    function generatedPositionAfter(mappingA, mappingB) {
      const lineA = mappingA.generatedLine;
      const lineB = mappingB.generatedLine;
      const columnA = mappingA.generatedColumn;
      const columnB = mappingB.generatedColumn;
      return lineB > lineA || lineB == lineA && columnB >= columnA || util.compareByGeneratedPositionsInflated(mappingA, mappingB) <= 0;
    }
    var MappingList = class {
      constructor() {
        this._array = [];
        this._sorted = true;
        this._last = { generatedLine: -1, generatedColumn: 0 };
      }
      /**
       * Iterate through internal items. This method takes the same arguments that
       * `Array.prototype.forEach` takes.
       *
       * NOTE: The order of the mappings is NOT guaranteed.
       */
      unsortedForEach(aCallback, aThisArg) {
        this._array.forEach(aCallback, aThisArg);
      }
      /**
       * Add the given source mapping.
       *
       * @param Object aMapping
       */
      add(aMapping) {
        if (generatedPositionAfter(this._last, aMapping)) {
          this._last = aMapping;
          this._array.push(aMapping);
        } else {
          this._sorted = false;
          this._array.push(aMapping);
        }
      }
      /**
       * Returns the flat, sorted array of mappings. The mappings are sorted by
       * generated position.
       *
       * WARNING: This method returns internal data without copying, for
       * performance. The return value must NOT be mutated, and should be treated as
       * an immutable borrow. If you want to take ownership, you must make your own
       * copy.
       */
      toArray() {
        if (!this._sorted) {
          this._array.sort(util.compareByGeneratedPositionsInflated);
          this._sorted = true;
        }
        return this._array;
      }
    };
    exports2.MappingList = MappingList;
  }
});

// ../../node_modules/source-map-generator/lib/source-map-generator.js
var require_source_map_generator = __commonJS({
  "../../node_modules/source-map-generator/lib/source-map-generator.js"(exports2) {
    var base64VLQ = require_base64_vlq();
    var util = require_util();
    var ArraySet = require_array_set().ArraySet;
    var MappingList = require_mapping_list().MappingList;
    var SourceMapGenerator = class _SourceMapGenerator {
      constructor(aArgs) {
        if (!aArgs) {
          aArgs = {};
        }
        this._file = util.getArg(aArgs, "file", null);
        this._sourceRoot = util.getArg(aArgs, "sourceRoot", null);
        this._skipValidation = util.getArg(aArgs, "skipValidation", false);
        this._sources = new ArraySet();
        this._names = new ArraySet();
        this._mappings = new MappingList();
        this._sourcesContents = null;
      }
      /**
       * Creates a new SourceMapGenerator based on a SourceMapConsumer
       *
       * @param aSourceMapConsumer The SourceMap.
       */
      static fromSourceMap(aSourceMapConsumer) {
        const sourceRoot = aSourceMapConsumer.sourceRoot;
        const generator = new _SourceMapGenerator({
          file: aSourceMapConsumer.file,
          sourceRoot
        });
        aSourceMapConsumer.eachMapping(function(mapping) {
          const newMapping = {
            generated: {
              line: mapping.generatedLine,
              column: mapping.generatedColumn
            }
          };
          if (mapping.source != null) {
            newMapping.source = mapping.source;
            if (sourceRoot != null) {
              newMapping.source = util.relative(sourceRoot, newMapping.source);
            }
            newMapping.original = {
              line: mapping.originalLine,
              column: mapping.originalColumn
            };
            if (mapping.name != null) {
              newMapping.name = mapping.name;
            }
          }
          generator.addMapping(newMapping);
        });
        aSourceMapConsumer.sources.forEach(function(sourceFile) {
          let sourceRelative = sourceFile;
          if (sourceRoot != null) {
            sourceRelative = util.relative(sourceRoot, sourceFile);
          }
          if (!generator._sources.has(sourceRelative)) {
            generator._sources.add(sourceRelative);
          }
          const content = aSourceMapConsumer.sourceContentFor(sourceFile);
          if (content != null) {
            generator.setSourceContent(sourceFile, content);
          }
        });
        return generator;
      }
      /**
       * Add a single mapping from original source line and column to the generated
       * source's line and column for this source map being created. The mapping
       * object should have the following properties:
       *
       *   - generated: An object with the generated line and column positions.
       *   - original: An object with the original line and column positions.
       *   - source: The original source file (relative to the sourceRoot).
       *   - name: An optional original token name for this mapping.
       */
      addMapping(aArgs) {
        const generated = util.getArg(aArgs, "generated");
        const original = util.getArg(aArgs, "original", null);
        let source = util.getArg(aArgs, "source", null);
        let name = util.getArg(aArgs, "name", null);
        if (!this._skipValidation) {
          this._validateMapping(generated, original, source, name);
        }
        if (source != null) {
          source = String(source);
          if (!this._sources.has(source)) {
            this._sources.add(source);
          }
        }
        if (name != null) {
          name = String(name);
          if (!this._names.has(name)) {
            this._names.add(name);
          }
        }
        this._mappings.add({
          generatedLine: generated.line,
          generatedColumn: generated.column,
          originalLine: original && original.line,
          originalColumn: original && original.column,
          source,
          name
        });
      }
      /**
       * Set the source content for a source file.
       */
      setSourceContent(aSourceFile, aSourceContent) {
        let source = aSourceFile;
        if (this._sourceRoot != null) {
          source = util.relative(this._sourceRoot, source);
        }
        if (aSourceContent != null) {
          if (!this._sourcesContents) {
            this._sourcesContents = /* @__PURE__ */ Object.create(null);
          }
          this._sourcesContents[util.toSetString(source)] = aSourceContent;
        } else if (this._sourcesContents) {
          delete this._sourcesContents[util.toSetString(source)];
          if (Object.keys(this._sourcesContents).length === 0) {
            this._sourcesContents = null;
          }
        }
      }
      /**
       * Applies the mappings of a sub-source-map for a specific source file to the
       * source map being generated. Each mapping to the supplied source file is
       * rewritten using the supplied source map. Note: The resolution for the
       * resulting mappings is the minimium of this map and the supplied map.
       *
       * @param aSourceMapConsumer The source map to be applied.
       * @param aSourceFile Optional. The filename of the source file.
       *        If omitted, SourceMapConsumer's file property will be used.
       * @param aSourceMapPath Optional. The dirname of the path to the source map
       *        to be applied. If relative, it is relative to the SourceMapConsumer.
       *        This parameter is needed when the two source maps aren't in the same
       *        directory, and the source map to be applied contains relative source
       *        paths. If so, those relative source paths need to be rewritten
       *        relative to the SourceMapGenerator.
       */
      applySourceMap(aSourceMapConsumer, aSourceFile, aSourceMapPath) {
        let sourceFile = aSourceFile;
        if (aSourceFile == null) {
          if (aSourceMapConsumer.file == null) {
            throw new Error(
              `SourceMapGenerator.prototype.applySourceMap requires either an explicit source file, or the source map's "file" property. Both were omitted.`
            );
          }
          sourceFile = aSourceMapConsumer.file;
        }
        const sourceRoot = this._sourceRoot;
        if (sourceRoot != null) {
          sourceFile = util.relative(sourceRoot, sourceFile);
        }
        const newSources = this._mappings.toArray().length > 0 ? new ArraySet() : this._sources;
        const newNames = new ArraySet();
        this._mappings.unsortedForEach(function(mapping) {
          if (mapping.source === sourceFile && mapping.originalLine != null) {
            const original = aSourceMapConsumer.originalPositionFor({
              line: mapping.originalLine,
              column: mapping.originalColumn
            });
            if (original.source != null) {
              mapping.source = original.source;
              if (aSourceMapPath != null) {
                mapping.source = util.join(aSourceMapPath, mapping.source);
              }
              if (sourceRoot != null) {
                mapping.source = util.relative(sourceRoot, mapping.source);
              }
              mapping.originalLine = original.line;
              mapping.originalColumn = original.column;
              if (original.name != null) {
                mapping.name = original.name;
              }
            }
          }
          const source = mapping.source;
          if (source != null && !newSources.has(source)) {
            newSources.add(source);
          }
          const name = mapping.name;
          if (name != null && !newNames.has(name)) {
            newNames.add(name);
          }
        }, this);
        this._sources = newSources;
        this._names = newNames;
        aSourceMapConsumer.sources.forEach(function(srcFile) {
          const content = aSourceMapConsumer.sourceContentFor(srcFile);
          if (content != null) {
            if (aSourceMapPath != null) {
              srcFile = util.join(aSourceMapPath, srcFile);
            }
            if (sourceRoot != null) {
              srcFile = util.relative(sourceRoot, srcFile);
            }
            this.setSourceContent(srcFile, content);
          }
        }, this);
      }
      /**
       * A mapping can have one of the three levels of data:
       *
       *   1. Just the generated position.
       *   2. The Generated position, original position, and original source.
       *   3. Generated and original position, original source, as well as a name
       *      token.
       *
       * To maintain consistency, we validate that any new mapping being added falls
       * in to one of these categories.
       */
      _validateMapping(aGenerated, aOriginal, aSource, aName) {
        if (aOriginal && typeof aOriginal.line !== "number" && typeof aOriginal.column !== "number") {
          throw new Error(
            "original.line and original.column are not numbers -- you probably meant to omit the original mapping entirely and only map the generated position. If so, pass null for the original mapping instead of an object with empty or null values."
          );
        }
        if (aGenerated && "line" in aGenerated && "column" in aGenerated && aGenerated.line > 0 && aGenerated.column >= 0 && !aOriginal && !aSource && !aName) {
        } else if (aGenerated && "line" in aGenerated && "column" in aGenerated && aOriginal && "line" in aOriginal && "column" in aOriginal && aGenerated.line > 0 && aGenerated.column >= 0 && aOriginal.line > 0 && aOriginal.column >= 0 && aSource) {
        } else {
          throw new Error(
            "Invalid mapping: " + JSON.stringify({
              generated: aGenerated,
              source: aSource,
              original: aOriginal,
              name: aName
            })
          );
        }
      }
      /**
       * Serialize the accumulated mappings in to the stream of base 64 VLQs
       * specified by the source map format.
       */
      _serializeMappings() {
        let previousGeneratedColumn = 0;
        let previousGeneratedLine = 1;
        let previousOriginalColumn = 0;
        let previousOriginalLine = 0;
        let previousName = 0;
        let previousSource = 0;
        let result = "";
        let next;
        let mapping;
        let nameIdx;
        let sourceIdx;
        const mappings = this._mappings.toArray();
        for (let i = 0, len = mappings.length; i < len; i++) {
          mapping = mappings[i];
          next = "";
          if (mapping.generatedLine !== previousGeneratedLine) {
            previousGeneratedColumn = 0;
            while (mapping.generatedLine !== previousGeneratedLine) {
              next += ";";
              previousGeneratedLine++;
            }
          } else if (i > 0) {
            if (!util.compareByGeneratedPositionsInflated(mapping, mappings[i - 1])) {
              continue;
            }
            next += ",";
          }
          next += base64VLQ.encode(
            mapping.generatedColumn - previousGeneratedColumn
          );
          previousGeneratedColumn = mapping.generatedColumn;
          if (mapping.source != null) {
            sourceIdx = this._sources.indexOf(mapping.source);
            next += base64VLQ.encode(sourceIdx - previousSource);
            previousSource = sourceIdx;
            next += base64VLQ.encode(
              mapping.originalLine - 1 - previousOriginalLine
            );
            previousOriginalLine = mapping.originalLine - 1;
            next += base64VLQ.encode(
              mapping.originalColumn - previousOriginalColumn
            );
            previousOriginalColumn = mapping.originalColumn;
            if (mapping.name != null) {
              nameIdx = this._names.indexOf(mapping.name);
              next += base64VLQ.encode(nameIdx - previousName);
              previousName = nameIdx;
            }
          }
          result += next;
        }
        return result;
      }
      _generateSourcesContent(aSources, aSourceRoot) {
        return aSources.map(function(source) {
          if (!this._sourcesContents) {
            return null;
          }
          if (aSourceRoot != null) {
            source = util.relative(aSourceRoot, source);
          }
          const key = util.toSetString(source);
          return Object.prototype.hasOwnProperty.call(this._sourcesContents, key) ? this._sourcesContents[key] : null;
        }, this);
      }
      /**
       * Externalize the source map.
       */
      toJSON() {
        const map2 = {
          version: this._version,
          sources: this._sources.toArray(),
          names: this._names.toArray(),
          mappings: this._serializeMappings()
        };
        if (this._file != null) {
          map2.file = this._file;
        }
        if (this._sourceRoot != null) {
          map2.sourceRoot = this._sourceRoot;
        }
        if (this._sourcesContents) {
          map2.sourcesContent = this._generateSourcesContent(
            map2.sources,
            map2.sourceRoot
          );
        }
        return map2;
      }
      /**
       * Render the source map being generated to a string.
       */
      toString() {
        return JSON.stringify(this.toJSON());
      }
    };
    SourceMapGenerator.prototype._version = 3;
    exports2.SourceMapGenerator = SourceMapGenerator;
  }
});

// ../../node_modules/source-map-generator/lib/source-node.js
var require_source_node = __commonJS({
  "../../node_modules/source-map-generator/lib/source-node.js"(exports2) {
    var SourceMapGenerator = require_source_map_generator().SourceMapGenerator;
    var util = require_util();
    var REGEX_NEWLINE = /(\r?\n)/;
    var NEWLINE_CODE = 10;
    var isSourceNode = "$$$isSourceNode$$$";
    var SourceNode = class _SourceNode {
      constructor(aLine, aColumn, aSource, aChunks, aName) {
        this.children = [];
        this.sourceContents = {};
        this.line = aLine == null ? null : aLine;
        this.column = aColumn == null ? null : aColumn;
        this.source = aSource == null ? null : aSource;
        this.name = aName == null ? null : aName;
        this[isSourceNode] = true;
        if (aChunks != null) this.add(aChunks);
      }
      /**
       * Creates a SourceNode from generated code and a SourceMapConsumer.
       *
       * @param aGeneratedCode The generated code
       * @param aSourceMapConsumer The SourceMap for the generated code
       * @param aRelativePath Optional. The path that relative sources in the
       *        SourceMapConsumer should be relative to.
       */
      static fromStringWithSourceMap(aGeneratedCode, aSourceMapConsumer, aRelativePath) {
        const node = new _SourceNode();
        const remainingLines = aGeneratedCode.split(REGEX_NEWLINE);
        let remainingLinesIndex = 0;
        const shiftNextLine = function() {
          const lineContents = getNextLine();
          const newLine = getNextLine() || "";
          return lineContents + newLine;
          function getNextLine() {
            return remainingLinesIndex < remainingLines.length ? remainingLines[remainingLinesIndex++] : void 0;
          }
        };
        let lastGeneratedLine = 1, lastGeneratedColumn = 0;
        let lastMapping = null;
        let nextLine;
        aSourceMapConsumer.eachMapping(function(mapping) {
          if (lastMapping !== null) {
            if (lastGeneratedLine < mapping.generatedLine) {
              addMappingWithCode(lastMapping, shiftNextLine());
              lastGeneratedLine++;
              lastGeneratedColumn = 0;
            } else {
              nextLine = remainingLines[remainingLinesIndex] || "";
              const code = nextLine.substr(
                0,
                mapping.generatedColumn - lastGeneratedColumn
              );
              remainingLines[remainingLinesIndex] = nextLine.substr(
                mapping.generatedColumn - lastGeneratedColumn
              );
              lastGeneratedColumn = mapping.generatedColumn;
              addMappingWithCode(lastMapping, code);
              lastMapping = mapping;
              return;
            }
          }
          while (lastGeneratedLine < mapping.generatedLine) {
            node.add(shiftNextLine());
            lastGeneratedLine++;
          }
          if (lastGeneratedColumn < mapping.generatedColumn) {
            nextLine = remainingLines[remainingLinesIndex] || "";
            node.add(nextLine.substr(0, mapping.generatedColumn));
            remainingLines[remainingLinesIndex] = nextLine.substr(
              mapping.generatedColumn
            );
            lastGeneratedColumn = mapping.generatedColumn;
          }
          lastMapping = mapping;
        }, this);
        if (remainingLinesIndex < remainingLines.length) {
          if (lastMapping) {
            addMappingWithCode(lastMapping, shiftNextLine());
          }
          node.add(remainingLines.splice(remainingLinesIndex).join(""));
        }
        aSourceMapConsumer.sources.forEach(function(sourceFile) {
          const content = aSourceMapConsumer.sourceContentFor(sourceFile);
          if (content != null) {
            if (aRelativePath != null) {
              sourceFile = util.join(aRelativePath, sourceFile);
            }
            node.setSourceContent(sourceFile, content);
          }
        });
        return node;
        function addMappingWithCode(mapping, code) {
          if (mapping === null || mapping.source === void 0) {
            node.add(code);
          } else {
            const source = aRelativePath ? util.join(aRelativePath, mapping.source) : mapping.source;
            node.add(
              new _SourceNode(
                mapping.originalLine,
                mapping.originalColumn,
                source,
                code,
                mapping.name
              )
            );
          }
        }
      }
      /**
       * Add a chunk of generated JS to this source node.
       *
       * @param aChunk A string snippet of generated JS code, another instance of
       *        SourceNode, or an array where each member is one of those things.
       */
      add(aChunk) {
        if (Array.isArray(aChunk)) {
          aChunk.forEach(function(chunk) {
            this.add(chunk);
          }, this);
        } else if (aChunk[isSourceNode] || typeof aChunk === "string") {
          if (aChunk) {
            this.children.push(aChunk);
          }
        } else {
          throw new TypeError(
            "Expected a SourceNode, string, or an array of SourceNodes and strings. Got " + aChunk
          );
        }
        return this;
      }
      /**
       * Add a chunk of generated JS to the beginning of this source node.
       *
       * @param aChunk A string snippet of generated JS code, another instance of
       *        SourceNode, or an array where each member is one of those things.
       */
      prepend(aChunk) {
        if (Array.isArray(aChunk)) {
          for (let i = aChunk.length - 1; i >= 0; i--) {
            this.prepend(aChunk[i]);
          }
        } else if (aChunk[isSourceNode] || typeof aChunk === "string") {
          this.children.unshift(aChunk);
        } else {
          throw new TypeError(
            "Expected a SourceNode, string, or an array of SourceNodes and strings. Got " + aChunk
          );
        }
        return this;
      }
      /**
       * Walk over the tree of JS snippets in this node and its children. The
       * walking function is called once for each snippet of JS and is passed that
       * snippet and the its original associated source's line/column location.
       *
       * @param aFn The traversal function.
       */
      walk(aFn) {
        let chunk;
        for (let i = 0, len = this.children.length; i < len; i++) {
          chunk = this.children[i];
          if (chunk[isSourceNode]) {
            chunk.walk(aFn);
          } else if (chunk !== "") {
            aFn(chunk, {
              source: this.source,
              line: this.line,
              column: this.column,
              name: this.name
            });
          }
        }
      }
      /**
       * Like `String.prototype.join` except for SourceNodes. Inserts `aStr` between
       * each of `this.children`.
       *
       * @param aSep The separator.
       */
      join(aSep) {
        let newChildren;
        let i;
        const len = this.children.length;
        if (len > 0) {
          newChildren = [];
          for (i = 0; i < len - 1; i++) {
            newChildren.push(this.children[i]);
            newChildren.push(aSep);
          }
          newChildren.push(this.children[i]);
          this.children = newChildren;
        }
        return this;
      }
      /**
       * Call String.prototype.replace on the very right-most source snippet. Useful
       * for trimming whitespace from the end of a source node, etc.
       *
       * @param aPattern The pattern to replace.
       * @param aReplacement The thing to replace the pattern with.
       */
      replaceRight(aPattern, aReplacement) {
        const lastChild = this.children[this.children.length - 1];
        if (lastChild[isSourceNode]) {
          lastChild.replaceRight(aPattern, aReplacement);
        } else if (typeof lastChild === "string") {
          this.children[this.children.length - 1] = lastChild.replace(
            aPattern,
            aReplacement
          );
        } else {
          this.children.push("".replace(aPattern, aReplacement));
        }
        return this;
      }
      /**
       * Set the source content for a source file. This will be added to the SourceMapGenerator
       * in the sourcesContent field.
       *
       * @param aSourceFile The filename of the source file
       * @param aSourceContent The content of the source file
       */
      setSourceContent(aSourceFile, aSourceContent) {
        this.sourceContents[util.toSetString(aSourceFile)] = aSourceContent;
      }
      /**
       * Walk over the tree of SourceNodes. The walking function is called for each
       * source file content and is passed the filename and source content.
       *
       * @param aFn The traversal function.
       */
      walkSourceContents(aFn) {
        for (let i = 0, len = this.children.length; i < len; i++) {
          if (this.children[i][isSourceNode]) {
            this.children[i].walkSourceContents(aFn);
          }
        }
        const sources = Object.keys(this.sourceContents);
        for (let i = 0, len = sources.length; i < len; i++) {
          aFn(util.fromSetString(sources[i]), this.sourceContents[sources[i]]);
        }
      }
      /**
       * Return the string representation of this source node. Walks over the tree
       * and concatenates all the various snippets together to one string.
       */
      toString() {
        let str2 = "";
        this.walk(function(chunk) {
          str2 += chunk;
        });
        return str2;
      }
      /**
       * Returns the string representation of this source node along with a source
       * map.
       */
      toStringWithSourceMap(aArgs) {
        const generated = {
          code: "",
          line: 1,
          column: 0
        };
        const map2 = new SourceMapGenerator(aArgs);
        let sourceMappingActive = false;
        let lastOriginalSource = null;
        let lastOriginalLine = null;
        let lastOriginalColumn = null;
        let lastOriginalName = null;
        this.walk(function(chunk, original) {
          generated.code += chunk;
          if (original.source !== null && original.line !== null && original.column !== null) {
            if (lastOriginalSource !== original.source || lastOriginalLine !== original.line || lastOriginalColumn !== original.column || lastOriginalName !== original.name) {
              map2.addMapping({
                source: original.source,
                original: {
                  line: original.line,
                  column: original.column
                },
                generated: {
                  line: generated.line,
                  column: generated.column
                },
                name: original.name
              });
            }
            lastOriginalSource = original.source;
            lastOriginalLine = original.line;
            lastOriginalColumn = original.column;
            lastOriginalName = original.name;
            sourceMappingActive = true;
          } else if (sourceMappingActive) {
            map2.addMapping({
              generated: {
                line: generated.line,
                column: generated.column
              }
            });
            lastOriginalSource = null;
            sourceMappingActive = false;
          }
          for (let idx = 0, length = chunk.length; idx < length; idx++) {
            if (chunk.charCodeAt(idx) === NEWLINE_CODE) {
              generated.line++;
              generated.column = 0;
              if (idx + 1 === length) {
                lastOriginalSource = null;
                sourceMappingActive = false;
              } else if (sourceMappingActive) {
                map2.addMapping({
                  source: original.source,
                  original: {
                    line: original.line,
                    column: original.column
                  },
                  generated: {
                    line: generated.line,
                    column: generated.column
                  },
                  name: original.name
                });
              }
            } else {
              generated.column++;
            }
          }
        });
        this.walkSourceContents(function(sourceFile, sourceContent) {
          map2.setSourceContent(sourceFile, sourceContent);
        });
        return { code: generated.code, map: map2 };
      }
    };
    exports2.SourceNode = SourceNode;
  }
});

// ../../node_modules/source-map-generator/source-map.js
var require_source_map = __commonJS({
  "../../node_modules/source-map-generator/source-map.js"(exports2) {
    exports2.SourceMapGenerator = require_source_map_generator().SourceMapGenerator;
    exports2.SourceNode = require_source_node().SourceNode;
  }
});

// ../../node_modules/peggy/lib/compiler/stack.js
var require_stack = __commonJS({
  "../../node_modules/peggy/lib/compiler/stack.js"(exports2, module2) {
    "use strict";
    var { SourceNode } = require_source_map();
    var GrammarLocation = require_grammar_location();
    var Stack = class _Stack {
      /**
       * Constructs the helper for tracking variable slots of the stack virtual machine
       *
       * @param {string} ruleName The name of rule that will be used in error messages
       * @param {string} varName The prefix for generated names of variables
       * @param {string} type The type of the variables. For JavaScript there are `var` or `let`
       * @param {number[]} bytecode Bytecode for error messages
       */
      constructor(ruleName, varName, type2, bytecode) {
        this.sp = -1;
        this.maxSp = -1;
        this.varName = varName;
        this.ruleName = ruleName;
        this.type = type2;
        this.bytecode = bytecode;
        this.labels = {};
        this.sourceMapStack = [];
      }
      /**
       * Returns name of the variable at the index `i`.
       *
       * @param {number} i Index for which name must be generated
       * @return {string} Generated name
       *
       * @throws {RangeError} If `i < 0`, which means a stack underflow (there are more `pop`s than `push`es)
       */
      name(i) {
        if (i < 0) {
          throw new RangeError(
            `Rule '${this.ruleName}': The variable stack underflow: attempt to use a variable '${this.varName}<x>' at an index ${i}.
Bytecode: ${this.bytecode}`
          );
        }
        return this.varName + i;
      }
      /**
       *
       * @param {PEG.LocationRange} location
       * @param {SourceArray} chunks
       * @param {string} [name]
       * @returns
       */
      static sourceNode(location, chunks, name) {
        const start = GrammarLocation.offsetStart(location);
        return new SourceNode(
          start.line,
          start.column ? start.column - 1 : null,
          String(location.source),
          chunks,
          name
        );
      }
      /**
       * Assigns `exprCode` to the new variable in the stack, returns generated code.
       * As the result, the size of a stack increases on 1.
       *
       * @param {string} exprCode Any expression code that must be assigned to the new variable in the stack
       * @return {string|SourceNode} Assignment code
       */
      push(exprCode) {
        if (++this.sp > this.maxSp) {
          this.maxSp = this.sp;
        }
        const label = this.labels[this.sp];
        const code = [this.name(this.sp), " = ", exprCode, ";"];
        if (label) {
          if (this.sourceMapStack.length) {
            const sourceNode = _Stack.sourceNode(
              label.location,
              code.splice(0, 2),
              label.label
            );
            const { parts, location } = this.sourceMapPopInternal();
            const newLoc = location.start.offset < label.location.end.offset ? {
              start: label.location.end,
              end: location.end,
              source: location.source
            } : location;
            const outerNode = _Stack.sourceNode(
              newLoc,
              code.concat("\n")
            );
            this.sourceMapStack.push([parts, parts.length + 1, location]);
            return new SourceNode(
              null,
              null,
              label.location.source,
              [sourceNode, outerNode]
            );
          } else {
            return _Stack.sourceNode(
              label.location,
              code.concat("\n")
            );
          }
        }
        return code.join("");
      }
      /**
       * @overload
       * @param {undefined} [n]
       * @return {string}
       */
      /**
       * @overload
       * @param {number} n
       * @return {string[]}
       */
      /**
       * Returns name or `n` names of the variable(s) from the top of the stack.
       *
       * @param {number} [n] Quantity of variables, which need to be removed from the stack
       * @returns {string[]|string} Generated name(s). If n is defined then it returns an
       *                            array of length `n`
       *
       * @throws {RangeError} If the stack underflow (there are more `pop`s than `push`es)
       */
      pop(n) {
        if (n !== void 0) {
          this.sp -= n;
          return Array.from({ length: n }, (_v, i) => this.name(this.sp + 1 + i));
        }
        return this.name(this.sp--);
      }
      /**
       * Returns name of the first free variable. The same as `index(0)`.
       *
       * @return {string} Generated name
       *
       * @throws {RangeError} If the stack is empty (there was no `push`'s yet)
       */
      top() {
        return this.name(this.sp);
      }
      /**
       * Returns name of the variable at index `i`.
       *
       * @param {number} i Index of the variable from top of the stack
       * @return {string} Generated name
       *
       * @throws {RangeError} If `i < 0` or more than the stack size
       */
      index(i) {
        if (i < 0) {
          throw new RangeError(
            `Rule '${this.ruleName}': The variable stack overflow: attempt to get a variable at a negative index ${i}.
Bytecode: ${this.bytecode}`
          );
        }
        return this.name(this.sp - i);
      }
      /**
       * Returns variable name that contains result (bottom of the stack).
       *
       * @return {string} Generated name
       *
       * @throws {RangeError} If the stack is empty (there was no `push`es yet)
       */
      result() {
        if (this.maxSp < 0) {
          throw new RangeError(
            `Rule '${this.ruleName}': The variable stack is empty, can't get the result.
Bytecode: ${this.bytecode}`
          );
        }
        return this.name(0);
      }
      /**
       * Returns defines of all used variables.
       *
       * @return {string} Generated define variable expression with the type `this.type`.
       *         If the stack is empty, returns empty string
       */
      defines() {
        if (this.maxSp < 0) {
          return "";
        }
        return this.type + " " + Array.from({ length: this.maxSp + 1 }, (_v, i) => this.name(i)).join(", ") + ";";
      }
      /**
       * Checks that code in the `generateIf` and `generateElse` move the stack pointer in the same way.
       *
       * @template T
       * @param {number} pos Opcode number for error messages
       * @param {() => T} generateIf First function that works with this stack
       * @param {(() => T)|null} [generateElse] Second function that works with this stack
       * @return {T[]}
       *
       * @throws {Error} If `generateElse` is defined and the stack pointer moved differently in the
       *         `generateIf` and `generateElse`
       */
      checkedIf(pos, generateIf, generateElse) {
        const baseSp = this.sp;
        const ifResult = generateIf();
        if (!generateElse) {
          return [ifResult];
        }
        const thenSp = this.sp;
        this.sp = baseSp;
        const elseResult = generateElse();
        if (thenSp !== this.sp) {
          throw new Error(
            "Rule '" + this.ruleName + "', position " + pos + ": Branches of a condition can't move the stack pointer differently (before: " + baseSp + ", after then: " + thenSp + ", after else: " + this.sp + "). Bytecode: " + this.bytecode
          );
        }
        return [ifResult, elseResult];
      }
      /**
       * Checks that code in the `generateBody` do not move stack pointer.
       *
       * @template T
       * @param {number} pos Opcode number for error messages
       * @param {() => T} generateBody Function that works with this stack
       * @return {T}
       *
       * @throws {Error} If `generateBody` move the stack pointer (if it contains unbalanced `push`es and `pop`s)
       */
      checkedLoop(pos, generateBody) {
        const baseSp = this.sp;
        const result = generateBody();
        if (baseSp !== this.sp) {
          throw new Error(
            "Rule '" + this.ruleName + "', position " + pos + ": Body of a loop can't move the stack pointer (before: " + baseSp + ", after: " + this.sp + "). Bytecode: " + this.bytecode
          );
        }
        return result;
      }
      /**
       *
       * @param {SourceArray} parts
       * @param {PEG.LocationRange} location
       */
      sourceMapPush(parts, location) {
        if (this.sourceMapStack.length) {
          const top = this.sourceMapStack[this.sourceMapStack.length - 1];
          if (top[2].start.offset === location.start.offset && top[2].end.offset > location.end.offset) {
            top[2] = {
              start: location.end,
              end: top[2].end,
              source: top[2].source
            };
          }
        }
        this.sourceMapStack.push([
          parts,
          parts.length,
          location
        ]);
      }
      /**
       * @returns {{parts:SourceArray,location:PEG.LocationRange}}
       */
      sourceMapPopInternal() {
        const elt = this.sourceMapStack.pop();
        if (!elt) {
          throw new RangeError(
            `Rule '${this.ruleName}': Attempting to pop an empty source map stack.
Bytecode: ${this.bytecode}`
          );
        }
        const [
          parts,
          index,
          location
        ] = elt;
        const chunks = parts.splice(index).map(
          (chunk) => chunk instanceof SourceNode ? chunk : chunk + "\n"
        );
        if (chunks.length) {
          const start = GrammarLocation.offsetStart(location);
          parts.push(new SourceNode(
            start.line,
            start.column - 1,
            String(location.source),
            chunks
          ));
        }
        return { parts, location };
      }
      /**
       * @param {number} [offset]
       * @returns {[SourceArray, number, PEG.LocationRange]|undefined}
       */
      sourceMapPop(offset) {
        const { location } = this.sourceMapPopInternal();
        if (this.sourceMapStack.length && location.end.offset < this.sourceMapStack[this.sourceMapStack.length - 1][2].end.offset) {
          const { parts, location: outer } = this.sourceMapPopInternal();
          const newLoc = outer.start.offset < location.end.offset ? {
            start: location.end,
            end: outer.end,
            source: outer.source
          } : outer;
          this.sourceMapStack.push([
            parts,
            parts.length + (offset || 0),
            newLoc
          ]);
        }
        return void 0;
      }
    };
    module2.exports = Stack;
  }
});

// ../../node_modules/peggy/lib/version.js
var require_version = __commonJS({
  "../../node_modules/peggy/lib/version.js"(exports2) {
    "use strict";
    exports2.version = "5.1.0";
  }
});

// ../../node_modules/peggy/lib/compiler/utils.js
var require_utils = __commonJS({
  "../../node_modules/peggy/lib/compiler/utils.js"(exports2) {
    "use strict";
    function hex(ch) {
      return ch.codePointAt(0).toString(16).toUpperCase();
    }
    exports2.hex = hex;
    function stringEscape(s) {
      if (typeof s === "object") {
        return `\\\\${s.value}`;
      }
      return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\0/g, "\\0").replace(/\x08/g, "\\b").replace(/\t/g, "\\t").replace(/\n/g, "\\n").replace(/\v/g, "\\v").replace(/\f/g, "\\f").replace(/\r/g, "\\r").replace(/[\u{10000}-\u{10FFFF}]/gu, (ch) => `\\u{${hex(ch)}}`).replace(/[\x00-\x0F]/g, (ch) => "\\x0" + hex(ch)).replace(/[\x10-\x1F\x7F-\xFF]/g, (ch) => "\\x" + hex(ch)).replace(/[\u0100-\u0FFF]/g, (ch) => "\\u0" + hex(ch)).replace(/[\u1000-\uFFFF]/g, (ch) => "\\u" + hex(ch));
    }
    exports2.stringEscape = stringEscape;
    function regexpClassEscape(s) {
      if (typeof s === "object") {
        return `\\${s.value}`;
      }
      return s.replace(/\\/g, "\\\\").replace(/\//g, "\\/").replace(/]/g, "\\]").replace(/\^/g, "\\^").replace(/-/g, "\\-").replace(/\0/g, "\\0").replace(/\x08/g, "\\b").replace(/\t/g, "\\t").replace(/\n/g, "\\n").replace(/\v/g, "\\v").replace(/\f/g, "\\f").replace(/\r/g, "\\r").replace(/[\x00-\x0F]/g, (ch) => "\\x0" + hex(ch)).replace(/[\x10-\x1F\x7F-\xFF]/g, (ch) => "\\x" + hex(ch)).replace(/[\u{10000}-\u{10FFFF}]/gu, (ch) => "\\u{" + hex(ch) + "}").replace(/[\u0100-\u0FFF]/g, (ch) => "\\u0" + hex(ch)).replace(/[\u1000-\uFFFF]/g, (ch) => "\\u" + hex(ch));
    }
    exports2.regexpClassEscape = regexpClassEscape;
    function base642(u8) {
      const A = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
      const rem = u8.length % 3;
      const len = u8.length - rem;
      let res = "";
      for (let i = 0; i < len; i += 3) {
        res += A[u8[i] >> 2];
        res += A[(u8[i] & 3) << 4 | u8[i + 1] >> 4];
        res += A[(u8[i + 1] & 15) << 2 | u8[i + 2] >> 6];
        res += A[u8[i + 2] & 63];
      }
      if (rem === 1) {
        res += A[u8[len] >> 2];
        res += A[(u8[len] & 3) << 4];
        res += "==";
      } else if (rem === 2) {
        res += A[u8[len] >> 2];
        res += A[(u8[len] & 3) << 4 | u8[len + 1] >> 4];
        res += A[(u8[len + 1] & 15) << 2];
        res += "=";
      }
      return res;
    }
    exports2.base64 = base642;
    function codePointLen1(s) {
      const iter = s[Symbol.iterator]();
      const first = iter.next();
      if (first.done) {
        return -1;
      }
      const second = iter.next();
      if (!second.done) {
        return -1;
      }
      return first.value.codePointAt(0);
    }
    exports2.codePointLen1 = codePointLen1;
  }
});

// ../../node_modules/peggy/lib/parser.js
var require_parser = __commonJS({
  "../../node_modules/peggy/lib/parser.js"(exports2, module2) {
    "use strict";
    var OPS_TO_PREFIXED_TYPES = {
      "$": "text",
      "&": "simple_and",
      "!": "simple_not"
    };
    var OPS_TO_SUFFIXED_TYPES = {
      "?": "optional",
      "*": "zero_or_more",
      "+": "one_or_more"
    };
    var OPS_TO_SEMANTIC_PREDICATE_TYPES = {
      "&": "semantic_and",
      "!": "semantic_not"
    };
    var peg$SyntaxError = class extends SyntaxError {
      constructor(message, expected, found, location) {
        super(message);
        this.expected = expected;
        this.found = found;
        this.location = location;
        this.name = "SyntaxError";
      }
      format(sources) {
        let str2 = "Error: " + this.message;
        if (this.location) {
          let src = null;
          const st = sources.find((s2) => s2.source === this.location.source);
          if (st) {
            src = st.text.split(/\r\n|\n|\r/g);
          }
          const s = this.location.start;
          const offset_s = this.location.source && typeof this.location.source.offset === "function" ? this.location.source.offset(s) : s;
          const loc = this.location.source + ":" + offset_s.line + ":" + offset_s.column;
          if (src) {
            const e = this.location.end;
            const filler = "".padEnd(offset_s.line.toString().length, " ");
            const line = src[s.line - 1];
            const last = s.line === e.line ? e.column : line.length + 1;
            const hatLen = last - s.column || 1;
            str2 += "\n --> " + loc + "\n" + filler + " |\n" + offset_s.line + " | " + line + "\n" + filler + " | " + "".padEnd(s.column - 1, " ") + "".padEnd(hatLen, "^");
          } else {
            str2 += "\n at " + loc;
          }
        }
        return str2;
      }
      static buildMessage(expected, found) {
        function hex(ch) {
          return ch.codePointAt(0).toString(16).toUpperCase();
        }
        const nonPrintable = Object.prototype.hasOwnProperty.call(RegExp.prototype, "unicode") ? new RegExp("[\\p{C}\\p{Mn}\\p{Mc}]", "gu") : null;
        function unicodeEscape(s) {
          if (nonPrintable) {
            return s.replace(nonPrintable, (ch) => "\\u{" + hex(ch) + "}");
          }
          return s;
        }
        function literalEscape(s) {
          return unicodeEscape(s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\0/g, "\\0").replace(/\t/g, "\\t").replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/[\x00-\x0F]/g, (ch) => "\\x0" + hex(ch)).replace(/[\x10-\x1F\x7F-\x9F]/g, (ch) => "\\x" + hex(ch)));
        }
        function classEscape(s) {
          return unicodeEscape(s.replace(/\\/g, "\\\\").replace(/\]/g, "\\]").replace(/\^/g, "\\^").replace(/-/g, "\\-").replace(/\0/g, "\\0").replace(/\t/g, "\\t").replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/[\x00-\x0F]/g, (ch) => "\\x0" + hex(ch)).replace(/[\x10-\x1F\x7F-\x9F]/g, (ch) => "\\x" + hex(ch)));
        }
        const DESCRIBE_EXPECTATION_FNS = {
          literal(expectation) {
            return '"' + literalEscape(expectation.text) + '"';
          },
          class(expectation) {
            const escapedParts = expectation.parts.map(
              (part) => Array.isArray(part) ? classEscape(part[0]) + "-" + classEscape(part[1]) : classEscape(part)
            );
            return "[" + (expectation.inverted ? "^" : "") + escapedParts.join("") + "]" + (expectation.unicode ? "u" : "");
          },
          any() {
            return "any character";
          },
          end() {
            return "end of input";
          },
          other(expectation) {
            return expectation.description;
          }
        };
        function describeExpectation(expectation) {
          return DESCRIBE_EXPECTATION_FNS[expectation.type](expectation);
        }
        function describeExpected(expected2) {
          const descriptions = expected2.map(describeExpectation);
          descriptions.sort();
          if (descriptions.length > 0) {
            let j = 1;
            for (let i = 1; i < descriptions.length; i++) {
              if (descriptions[i - 1] !== descriptions[i]) {
                descriptions[j] = descriptions[i];
                j++;
              }
            }
            descriptions.length = j;
          }
          switch (descriptions.length) {
            case 1:
              return descriptions[0];
            case 2:
              return descriptions[0] + " or " + descriptions[1];
            default:
              return descriptions.slice(0, -1).join(", ") + ", or " + descriptions[descriptions.length - 1];
          }
        }
        function describeFound(found2) {
          return found2 ? '"' + literalEscape(found2) + '"' : "end of input";
        }
        return "Expected " + describeExpected(expected) + " but " + describeFound(found) + " found.";
      }
    };
    function peg$parse(input, options2) {
      options2 = options2 !== void 0 ? options2 : {};
      const peg$FAILED = {};
      const peg$source = options2.grammarSource;
      const peg$startRuleFunctions = {
        Grammar: peg$parseGrammar,
        ImportsAndSource: peg$parseImportsAndSource
      };
      let peg$startRuleFunction = peg$parseGrammar;
      const peg$c0 = "import";
      const peg$c1 = ";";
      const peg$c2 = ",";
      const peg$c3 = "*";
      const peg$c4 = "as";
      const peg$c5 = "{";
      const peg$c6 = "}";
      const peg$c7 = "from";
      const peg$c8 = "=";
      const peg$c9 = "/";
      const peg$c10 = "@";
      const peg$c11 = ":";
      const peg$c12 = "|";
      const peg$c13 = "..";
      const peg$c14 = "(";
      const peg$c15 = ")";
      const peg$c16 = ".";
      const peg$c17 = "\n";
      const peg$c18 = "\r\n";
      const peg$c19 = "/*";
      const peg$c20 = "*/";
      const peg$c21 = "//";
      const peg$c22 = "\\";
      const peg$c23 = "i";
      const peg$c24 = '"';
      const peg$c25 = "'";
      const peg$c26 = "[";
      const peg$c27 = "^";
      const peg$c28 = "]";
      const peg$c29 = "p";
      const peg$c30 = "_";
      const peg$c31 = "u";
      const peg$c32 = "-";
      const peg$c33 = "0";
      const peg$c34 = "b";
      const peg$c35 = "f";
      const peg$c36 = "n";
      const peg$c37 = "r";
      const peg$c38 = "t";
      const peg$c39 = "v";
      const peg$c40 = "x";
      const peg$r0 = /^[!$&]/;
      const peg$r1 = /^[*-+?]/;
      const peg$r2 = /^[!&]/;
      const peg$r3 = /^[\0-\uD7FF\uE000-\uFFFF]/;
      const peg$r4 = /^[\uD800-\uDBFF]/;
      const peg$r5 = /^[\uDC00-\uDFFF]/;
      const peg$r6 = /^[\uD800-\uDFFF]/;
      const peg$r7 = /^[\t\v-\f \p{Zs}\xA0\uFEFF]/u;
      const peg$r8 = /^[\n\r\u2028\u2029]/;
      const peg$r9 = /^[\r\u2028-\u2029]/;
      const peg$r10 = /^[\p{ID_Start}_]/u;
      const peg$r11 = /^[$\p{ID_Continue}]/u;
      const peg$r12 = /^[\n\r"\\\u2028-\u2029]/;
      const peg$r13 = /^[\n\r'\\\u2028-\u2029]/;
      const peg$r14 = /^[a-z]/i;
      const peg$r15 = /^[\n\r\\-\]\u2028-\u2029]/;
      const peg$r16 = /^["'\\]/;
      const peg$r17 = /^[0-9pux]/;
      const peg$r18 = /^[0-9]/;
      const peg$r19 = /^[0-9a-f]/i;
      const peg$r20 = /^[{}]/;
      const peg$e0 = peg$anyExpectation();
      const peg$e1 = peg$literalExpectation("import", false);
      const peg$e2 = peg$literalExpectation(";", false);
      const peg$e3 = peg$literalExpectation(",", false);
      const peg$e4 = peg$literalExpectation("*", false);
      const peg$e5 = peg$literalExpectation("as", false);
      const peg$e6 = peg$literalExpectation("{", false);
      const peg$e7 = peg$literalExpectation("}", false);
      const peg$e8 = peg$literalExpectation("from", false);
      const peg$e9 = peg$literalExpectation("=", false);
      const peg$e10 = peg$literalExpectation("/", false);
      const peg$e11 = peg$literalExpectation("@", false);
      const peg$e12 = peg$literalExpectation(":", false);
      const peg$e13 = peg$classExpectation(["!", "$", "&"], false, false, false);
      const peg$e14 = peg$classExpectation([["*", "+"], "?"], false, false, false);
      const peg$e15 = peg$literalExpectation("|", false);
      const peg$e16 = peg$literalExpectation("..", false);
      const peg$e17 = peg$literalExpectation("(", false);
      const peg$e18 = peg$literalExpectation(")", false);
      const peg$e19 = peg$literalExpectation(".", false);
      const peg$e20 = peg$classExpectation(["!", "&"], false, false, false);
      const peg$e21 = peg$classExpectation([["\0", "\uD7FF"], ["\uE000", "\uFFFF"]], false, false, false);
      const peg$e22 = peg$classExpectation([["\uD800", "\uDBFF"]], false, false, false);
      const peg$e23 = peg$classExpectation([["\uDC00", "\uDFFF"]], false, false, false);
      const peg$e24 = peg$classExpectation([["\uD800", "\uDFFF"]], false, false, false);
      const peg$e25 = peg$otherExpectation("whitespace");
      const peg$e26 = peg$classExpectation(["	", ["\v", "\f"], " ", "\\p{Zs}", "\xA0", "\uFEFF"], false, false, true);
      const peg$e27 = peg$classExpectation(["\n", "\r", "\u2028", "\u2029"], false, false, false);
      const peg$e28 = peg$otherExpectation("end of line");
      const peg$e29 = peg$literalExpectation("\n", false);
      const peg$e30 = peg$literalExpectation("\r\n", false);
      const peg$e31 = peg$classExpectation(["\r", ["\u2028", "\u2029"]], false, false, false);
      const peg$e32 = peg$otherExpectation("comment");
      const peg$e33 = peg$literalExpectation("/*", false);
      const peg$e34 = peg$literalExpectation("*/", false);
      const peg$e35 = peg$literalExpectation("//", false);
      const peg$e36 = peg$otherExpectation("identifier");
      const peg$e37 = peg$classExpectation(["\\p{ID_Start}", "_"], false, false, true);
      const peg$e38 = peg$literalExpectation("\\", false);
      const peg$e39 = peg$classExpectation(["$", "\\p{ID_Continue}"], false, false, true);
      const peg$e40 = peg$otherExpectation("literal");
      const peg$e41 = peg$literalExpectation("i", false);
      const peg$e42 = peg$otherExpectation("string");
      const peg$e43 = peg$literalExpectation('"', false);
      const peg$e44 = peg$literalExpectation("'", false);
      const peg$e45 = peg$classExpectation(["\n", "\r", '"', "\\", ["\u2028", "\u2029"]], false, false, false);
      const peg$e46 = peg$classExpectation(["\n", "\r", "'", "\\", ["\u2028", "\u2029"]], false, false, false);
      const peg$e47 = peg$otherExpectation("character class");
      const peg$e48 = peg$literalExpectation("[", false);
      const peg$e49 = peg$literalExpectation("^", false);
      const peg$e50 = peg$literalExpectation("]", false);
      const peg$e51 = peg$literalExpectation("p", true);
      const peg$e52 = peg$literalExpectation("_", false);
      const peg$e53 = peg$classExpectation([["a", "z"]], false, true, false);
      const peg$e54 = peg$literalExpectation("u", false);
      const peg$e55 = peg$literalExpectation("-", false);
      const peg$e56 = peg$classExpectation(["\n", "\r", ["\\", "]"], ["\u2028", "\u2029"]], false, false, false);
      const peg$e57 = peg$literalExpectation("0", false);
      const peg$e58 = peg$classExpectation(['"', "'", "\\"], false, false, false);
      const peg$e59 = peg$literalExpectation("b", false);
      const peg$e60 = peg$literalExpectation("f", false);
      const peg$e61 = peg$literalExpectation("n", false);
      const peg$e62 = peg$literalExpectation("r", false);
      const peg$e63 = peg$literalExpectation("t", false);
      const peg$e64 = peg$literalExpectation("v", false);
      const peg$e65 = peg$classExpectation([["0", "9"], "p", "u", "x"], false, false, false);
      const peg$e66 = peg$literalExpectation("x", false);
      const peg$e67 = peg$classExpectation([["0", "9"]], false, false, false);
      const peg$e68 = peg$classExpectation([["0", "9"], ["a", "f"]], false, true, false);
      const peg$e69 = peg$otherExpectation("code block");
      const peg$e70 = peg$classExpectation(["{", "}"], false, false, false);
      function peg$f0(imports, topLevelInitializer, initializer, rules) {
        return {
          type: "grammar",
          imports,
          topLevelInitializer,
          initializer,
          rules,
          location: location()
        };
      }
      function peg$f1(imports, body) {
        return [imports, body];
      }
      function peg$f2(code) {
        return {
          type: "top_level_initializer",
          code,
          codeLocation: location()
        };
      }
      function peg$f3(code) {
        return {
          type: "top_level_initializer",
          code,
          codeLocation: location()
        };
      }
      function peg$f4(what, from) {
        return {
          type: "grammar_import",
          what,
          from,
          location: location()
        };
      }
      function peg$f5(from) {
        return {
          type: "grammar_import",
          what: [],
          from,
          location: location()
        };
      }
      function peg$f6(first, others) {
        if (!others) {
          return [first];
        }
        others.unshift(first);
        return others;
      }
      function peg$f7(binding) {
        return {
          type: "import_binding_default",
          binding: binding[0],
          location: binding[1]
        };
      }
      function peg$f8(binding) {
        return [{
          type: "import_binding_all",
          binding: binding[0],
          location: binding[1]
        }];
      }
      function peg$f9() {
        return [];
      }
      function peg$f10(rename, binding) {
        return {
          type: "import_binding_rename",
          rename: rename[0],
          renameLocation: rename[1],
          binding: binding[0],
          location: binding[1]
        };
      }
      function peg$f11(binding) {
        return {
          type: "import_binding",
          binding: binding[0],
          location: binding[1]
        };
      }
      function peg$f12(module3) {
        return { type: "import_module_specifier", module: module3, location: location() };
      }
      function peg$f13(id) {
        return [id, location()];
      }
      function peg$f14(id) {
        return [id, location()];
      }
      function peg$f15(id) {
        if (reservedWords.has(id[0])) {
          error(`Binding identifier can't be a reserved word "${id[0]}"`, id[1]);
        }
        return id[0];
      }
      function peg$f16(code) {
        return {
          type: "top_level_initializer",
          code: code[0],
          codeLocation: code[1],
          location: location()
        };
      }
      function peg$f17(code) {
        return {
          type: "initializer",
          code: code[0],
          codeLocation: code[1],
          location: location()
        };
      }
      function peg$f18(name, displayName, expression) {
        return {
          type: "rule",
          name: name[0],
          nameLocation: name[1],
          expression: displayName !== null ? {
            type: "named",
            name: displayName,
            expression,
            location: location()
          } : expression,
          location: location()
        };
      }
      function peg$f19(head, tail) {
        return tail.length > 0 ? {
          type: "choice",
          alternatives: [head].concat(tail),
          location: location()
        } : head;
      }
      function peg$f20(expression, code) {
        return code !== null ? {
          type: "action",
          expression,
          code: code[0],
          codeLocation: code[1],
          location: location()
        } : expression;
      }
      function peg$f21(head, tail) {
        return tail.length > 0 || head.type === "labeled" && head.pick ? {
          type: "sequence",
          elements: [head].concat(tail),
          location: location()
        } : head;
      }
      function peg$f22(pluck, label, expression) {
        if (expression.type.startsWith("semantic_")) {
          error('"@" cannot be used on a semantic predicate', pluck);
        }
        return {
          type: "labeled",
          label: label !== null ? label[0] : null,
          // Use location of "@" if label is unavailable
          labelLocation: label !== null ? label[1] : pluck,
          pick: true,
          expression,
          location: location()
        };
      }
      function peg$f23(label, expression) {
        return {
          type: "labeled",
          label: label[0],
          labelLocation: label[1],
          expression,
          location: location()
        };
      }
      function peg$f24() {
        return location();
      }
      function peg$f25(label) {
        if (reservedWords.has(label[0])) {
          error(`Label can't be a reserved word "${label[0]}"`, label[1]);
        }
        return label;
      }
      function peg$f26(operator, expression) {
        return {
          type: OPS_TO_PREFIXED_TYPES[operator],
          expression,
          location: location()
        };
      }
      function peg$f27(expression, operator) {
        return {
          type: OPS_TO_SUFFIXED_TYPES[operator],
          expression,
          location: location()
        };
      }
      function peg$f28(expression, boundaries, delimiter) {
        const min = boundaries[0];
        const max = boundaries[1];
        if (max.type === "constant" && max.value === 0) {
          error("The maximum count of repetitions of the rule must be > 0", max.location);
        }
        return {
          type: "repeated",
          min,
          max,
          expression,
          delimiter,
          location: location()
        };
      }
      function peg$f29(min, max) {
        return [
          min !== null ? min : { type: "constant", value: 0 },
          max !== null ? max : { type: "constant", value: null }
        ];
      }
      function peg$f30(exact) {
        return [null, exact];
      }
      function peg$f31(value) {
        return { type: "constant", value, location: location() };
      }
      function peg$f32(value) {
        return { type: "variable", value: value[0], location: location() };
      }
      function peg$f33(value) {
        return {
          type: "function",
          value: value[0],
          codeLocation: value[1],
          location: location()
        };
      }
      function peg$f34(expression) {
        return expression.type === "labeled" || expression.type === "sequence" ? { type: "group", expression, location: location() } : expression;
      }
      function peg$f35(library, name) {
        return {
          type: "library_ref",
          name: name[0],
          library: library[0],
          libraryNumber: -1,
          location: location()
        };
      }
      function peg$f36(name) {
        return { type: "rule_ref", name: name[0], location: location() };
      }
      function peg$f37(operator, code) {
        return {
          type: OPS_TO_SEMANTIC_PREDICATE_TYPES[operator],
          code: code[0],
          codeLocation: code[1],
          location: location()
        };
      }
      function peg$f38(head, tail) {
        return [head + tail.join(""), location()];
      }
      function peg$f39(value, ignoreCase) {
        return {
          type: "literal",
          value,
          ignoreCase: ignoreCase !== null,
          location: location()
        };
      }
      function peg$f40(chars) {
        return chars.join("");
      }
      function peg$f41(chars) {
        return chars.join("");
      }
      function peg$f42(inverted, parts, flags) {
        if (inverted && parts.length === 0) {
          if (flags.unicode) {
            parts = [["\uD800", "\uDFFF"]];
          } else {
            return {
              type: "any",
              location: location()
            };
          }
        }
        return {
          type: "class",
          parts: parts.filter((part) => part !== ""),
          inverted: Boolean(inverted),
          ignoreCase: Boolean(flags.ignoreCase),
          location: location(),
          unicode: Boolean(flags.unicode) || parts.flat().some(
            (c) => typeof c === "object" && c.unicode || c.codePointAt(0) > 65535
          )
        };
      }
      function peg$f43(value) {
        try {
          new RegExp(`[\\${value}]`, "u");
        } catch (er) {
          error("Invalid Unicode property escape");
        }
        return {
          type: "classEscape",
          value,
          unicode: true,
          location: location()
        };
      }
      function peg$f44(flags) {
        const ret = Object.fromEntries(flags);
        if (Object.keys(ret).length !== flags.length) {
          error("Invalid flags");
        }
        return ret;
      }
      function peg$f45() {
        return ["ignoreCase", true];
      }
      function peg$f46() {
        return ["unicode", true];
      }
      function peg$f47(begin, end) {
        if (begin.codePointAt(0) > end.codePointAt(0)) {
          error(
            "Invalid character range: " + text() + "."
          );
        }
        return [begin, end];
      }
      function peg$f48() {
        return "";
      }
      function peg$f49() {
        return "\0";
      }
      function peg$f50() {
        return "\b";
      }
      function peg$f51() {
        return "\f";
      }
      function peg$f52() {
        return "\n";
      }
      function peg$f53() {
        return "\r";
      }
      function peg$f54() {
        return "	";
      }
      function peg$f55() {
        return "\v";
      }
      function peg$f56(digits) {
        return String.fromCharCode(parseInt(digits, 16));
      }
      function peg$f57(digits) {
        return String.fromCharCode(parseInt(digits, 16));
      }
      function peg$f58(digits) {
        return String.fromCodePoint(parseInt(digits, 16));
      }
      function peg$f59() {
        return { type: "any", location: location() };
      }
      function peg$f60(code) {
        return [code, location()];
      }
      function peg$f61(digits) {
        return parseInt(digits, 10);
      }
      let peg$currPos = options2.peg$currPos | 0;
      let peg$savedPos = peg$currPos;
      const peg$posDetailsCache = [{ line: 1, column: 1 }];
      let peg$maxFailPos = peg$currPos;
      let peg$maxFailExpected = options2.peg$maxFailExpected || [];
      let peg$silentFails = options2.peg$silentFails | 0;
      let peg$result;
      if (options2.startRule) {
        if (!(options2.startRule in peg$startRuleFunctions)) {
          throw new Error(`Can't start parsing from rule "` + options2.startRule + '".');
        }
        peg$startRuleFunction = peg$startRuleFunctions[options2.startRule];
      }
      function text() {
        return input.substring(peg$savedPos, peg$currPos);
      }
      function offset() {
        return peg$savedPos;
      }
      function range() {
        return {
          source: peg$source,
          start: peg$savedPos,
          end: peg$currPos
        };
      }
      function location() {
        return peg$computeLocation(peg$savedPos, peg$currPos);
      }
      function expected(description, location2) {
        location2 = location2 !== void 0 ? location2 : peg$computeLocation(peg$savedPos, peg$currPos);
        throw peg$buildStructuredError(
          [peg$otherExpectation(description)],
          input.substring(peg$savedPos, peg$currPos),
          location2
        );
      }
      function error(message, location2) {
        location2 = location2 !== void 0 ? location2 : peg$computeLocation(peg$savedPos, peg$currPos);
        throw peg$buildSimpleError(message, location2);
      }
      function peg$getUnicode(pos = peg$currPos) {
        const cp = input.codePointAt(pos);
        if (cp === void 0) {
          return "";
        }
        return String.fromCodePoint(cp);
      }
      function peg$literalExpectation(text2, ignoreCase) {
        return { type: "literal", text: text2, ignoreCase };
      }
      function peg$classExpectation(parts, inverted, ignoreCase, unicode) {
        return { type: "class", parts, inverted, ignoreCase, unicode };
      }
      function peg$anyExpectation() {
        return { type: "any" };
      }
      function peg$endExpectation() {
        return { type: "end" };
      }
      function peg$otherExpectation(description) {
        return { type: "other", description };
      }
      function peg$computePosDetails(pos) {
        let details = peg$posDetailsCache[pos];
        let p;
        if (details) {
          return details;
        } else {
          if (pos >= peg$posDetailsCache.length) {
            p = peg$posDetailsCache.length - 1;
          } else {
            p = pos;
            while (!peg$posDetailsCache[--p]) {
            }
          }
          details = peg$posDetailsCache[p];
          details = {
            line: details.line,
            column: details.column
          };
          while (p < pos) {
            if (input.charCodeAt(p) === 10) {
              details.line++;
              details.column = 1;
            } else {
              details.column++;
            }
            p++;
          }
          peg$posDetailsCache[pos] = details;
          return details;
        }
      }
      function peg$computeLocation(startPos, endPos, offset2) {
        const startPosDetails = peg$computePosDetails(startPos);
        const endPosDetails = peg$computePosDetails(endPos);
        const res = {
          source: peg$source,
          start: {
            offset: startPos,
            line: startPosDetails.line,
            column: startPosDetails.column
          },
          end: {
            offset: endPos,
            line: endPosDetails.line,
            column: endPosDetails.column
          }
        };
        if (offset2 && peg$source && typeof peg$source.offset === "function") {
          res.start = peg$source.offset(res.start);
          res.end = peg$source.offset(res.end);
        }
        return res;
      }
      function peg$fail(expected2) {
        if (peg$currPos < peg$maxFailPos) {
          return;
        }
        if (peg$currPos > peg$maxFailPos) {
          peg$maxFailPos = peg$currPos;
          peg$maxFailExpected = [];
        }
        peg$maxFailExpected.push(expected2);
      }
      function peg$buildSimpleError(message, location2) {
        return new peg$SyntaxError(message, null, null, location2);
      }
      function peg$buildStructuredError(expected2, found, location2) {
        return new peg$SyntaxError(
          peg$SyntaxError.buildMessage(expected2, found),
          expected2,
          found,
          location2
        );
      }
      function peg$parseGrammar() {
        let s0, s1, s2, s3, s4, s5, s6, s7, s8;
        s0 = peg$currPos;
        s1 = peg$parseImportDeclarations();
        s2 = peg$currPos;
        s3 = peg$parse__();
        s4 = peg$parseTopLevelInitializer();
        if (s4 !== peg$FAILED) {
          s2 = s4;
        } else {
          peg$currPos = s2;
          s2 = peg$FAILED;
        }
        if (s2 === peg$FAILED) {
          s2 = null;
        }
        s3 = peg$currPos;
        s4 = peg$parse__();
        s5 = peg$parseInitializer();
        if (s5 !== peg$FAILED) {
          s3 = s5;
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
        if (s3 === peg$FAILED) {
          s3 = null;
        }
        s4 = peg$parse__();
        s5 = [];
        s6 = peg$currPos;
        s7 = peg$parseRule();
        if (s7 !== peg$FAILED) {
          s8 = peg$parse__();
          s6 = s7;
        } else {
          peg$currPos = s6;
          s6 = peg$FAILED;
        }
        if (s6 !== peg$FAILED) {
          while (s6 !== peg$FAILED) {
            s5.push(s6);
            s6 = peg$currPos;
            s7 = peg$parseRule();
            if (s7 !== peg$FAILED) {
              s8 = peg$parse__();
              s6 = s7;
            } else {
              peg$currPos = s6;
              s6 = peg$FAILED;
            }
          }
        } else {
          s5 = peg$FAILED;
        }
        if (s5 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f0(s1, s2, s3, s5);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
        return s0;
      }
      function peg$parseImportsAndSource() {
        let s0, s1, s2;
        s0 = peg$currPos;
        s1 = peg$parseImportsAsText();
        s2 = peg$parseGrammarBody();
        peg$savedPos = s0;
        s0 = peg$f1(s1, s2);
        return s0;
      }
      function peg$parseGrammarBody() {
        let s0, s1, s2, s3;
        s0 = peg$currPos;
        s1 = peg$currPos;
        s2 = [];
        if (input.length > peg$currPos) {
          s3 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e0);
          }
        }
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          if (input.length > peg$currPos) {
            s3 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e0);
            }
          }
        }
        s1 = input.substring(s1, peg$currPos);
        peg$savedPos = s0;
        s1 = peg$f2(s1);
        s0 = s1;
        return s0;
      }
      function peg$parseImportsAsText() {
        let s0, s1, s2;
        s0 = peg$currPos;
        s1 = peg$currPos;
        s2 = peg$parseImportDeclarations();
        s1 = input.substring(s1, peg$currPos);
        peg$savedPos = s0;
        s1 = peg$f3(s1);
        s0 = s1;
        return s0;
      }
      function peg$parseImportDeclarations() {
        let s0, s1;
        s0 = [];
        s1 = peg$parseImportDeclaration();
        while (s1 !== peg$FAILED) {
          s0.push(s1);
          s1 = peg$parseImportDeclaration();
        }
        return s0;
      }
      function peg$parseImportDeclaration() {
        let s0, s1, s2, s3, s4, s5, s6, s7, s8, s9;
        s0 = peg$currPos;
        s1 = peg$parse__();
        if (input.substr(peg$currPos, 6) === peg$c0) {
          s2 = peg$c0;
          peg$currPos += 6;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e1);
          }
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parse__();
          s4 = peg$parseImportClause();
          if (s4 !== peg$FAILED) {
            s5 = peg$parse__();
            s6 = peg$parseFromClause();
            if (s6 !== peg$FAILED) {
              s7 = peg$currPos;
              s8 = peg$parse__();
              if (input.charCodeAt(peg$currPos) === 59) {
                s9 = peg$c1;
                peg$currPos++;
              } else {
                s9 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e2);
                }
              }
              if (s9 !== peg$FAILED) {
                s8 = [s8, s9];
                s7 = s8;
              } else {
                peg$currPos = s7;
                s7 = peg$FAILED;
              }
              if (s7 === peg$FAILED) {
                s7 = null;
              }
              peg$savedPos = s0;
              s0 = peg$f4(s4, s6);
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          s1 = peg$parse__();
          if (input.substr(peg$currPos, 6) === peg$c0) {
            s2 = peg$c0;
            peg$currPos += 6;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e1);
            }
          }
          if (s2 !== peg$FAILED) {
            s3 = peg$parse__();
            s4 = peg$parseModuleSpecifier();
            if (s4 !== peg$FAILED) {
              s5 = peg$currPos;
              s6 = peg$parse__();
              if (input.charCodeAt(peg$currPos) === 59) {
                s7 = peg$c1;
                peg$currPos++;
              } else {
                s7 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e2);
                }
              }
              if (s7 !== peg$FAILED) {
                s6 = [s6, s7];
                s5 = s6;
              } else {
                peg$currPos = s5;
                s5 = peg$FAILED;
              }
              if (s5 === peg$FAILED) {
                s5 = null;
              }
              peg$savedPos = s0;
              s0 = peg$f5(s4);
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        }
        return s0;
      }
      function peg$parseImportClause() {
        let s0, s1, s2, s3, s4, s5, s6;
        s0 = peg$parseNameSpaceImport();
        if (s0 === peg$FAILED) {
          s0 = peg$parseNamedImports();
          if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            s1 = peg$parseImportedDefaultBinding();
            if (s1 !== peg$FAILED) {
              s2 = peg$currPos;
              s3 = peg$parse__();
              if (input.charCodeAt(peg$currPos) === 44) {
                s4 = peg$c2;
                peg$currPos++;
              } else {
                s4 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e3);
                }
              }
              if (s4 !== peg$FAILED) {
                s5 = peg$parse__();
                s6 = peg$parseNameSpaceImport();
                if (s6 === peg$FAILED) {
                  s6 = peg$parseNamedImports();
                }
                if (s6 !== peg$FAILED) {
                  s2 = s6;
                } else {
                  peg$currPos = s2;
                  s2 = peg$FAILED;
                }
              } else {
                peg$currPos = s2;
                s2 = peg$FAILED;
              }
              if (s2 === peg$FAILED) {
                s2 = null;
              }
              peg$savedPos = s0;
              s0 = peg$f6(s1, s2);
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          }
        }
        return s0;
      }
      function peg$parseImportedDefaultBinding() {
        let s0, s1;
        s0 = peg$currPos;
        s1 = peg$parseImportedBinding();
        if (s1 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$f7(s1);
        }
        s0 = s1;
        return s0;
      }
      function peg$parseNameSpaceImport() {
        let s0, s1, s2, s3, s4, s5;
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 42) {
          s1 = peg$c3;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e4);
          }
        }
        if (s1 !== peg$FAILED) {
          s2 = peg$parse__();
          if (input.substr(peg$currPos, 2) === peg$c4) {
            s3 = peg$c4;
            peg$currPos += 2;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e5);
            }
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parse__();
            s5 = peg$parseImportedBinding();
            if (s5 !== peg$FAILED) {
              peg$savedPos = s0;
              s0 = peg$f8(s5);
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
        return s0;
      }
      function peg$parseNamedImports() {
        let s0, s1, s2, s3, s4, s5, s6, s7;
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 123) {
          s1 = peg$c5;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e6);
          }
        }
        if (s1 !== peg$FAILED) {
          s2 = peg$parse__();
          if (input.charCodeAt(peg$currPos) === 125) {
            s3 = peg$c6;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e7);
            }
          }
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s0 = peg$f9();
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          if (input.charCodeAt(peg$currPos) === 123) {
            s1 = peg$c5;
            peg$currPos++;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e6);
            }
          }
          if (s1 !== peg$FAILED) {
            s2 = peg$parse__();
            s3 = peg$parseImportsList();
            if (s3 !== peg$FAILED) {
              s4 = peg$parse__();
              s5 = peg$currPos;
              if (input.charCodeAt(peg$currPos) === 44) {
                s6 = peg$c2;
                peg$currPos++;
              } else {
                s6 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e3);
                }
              }
              if (s6 !== peg$FAILED) {
                s7 = peg$parse__();
                s6 = [s6, s7];
                s5 = s6;
              } else {
                peg$currPos = s5;
                s5 = peg$FAILED;
              }
              if (s5 === peg$FAILED) {
                s5 = null;
              }
              if (input.charCodeAt(peg$currPos) === 125) {
                s6 = peg$c6;
                peg$currPos++;
              } else {
                s6 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e7);
                }
              }
              if (s6 !== peg$FAILED) {
                s0 = s3;
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        }
        return s0;
      }
      function peg$parseFromClause() {
        let s0, s1, s2, s3;
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 4) === peg$c7) {
          s1 = peg$c7;
          peg$currPos += 4;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e8);
          }
        }
        if (s1 !== peg$FAILED) {
          s2 = peg$parse__();
          s3 = peg$parseModuleSpecifier();
          if (s3 !== peg$FAILED) {
            s0 = s3;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
        return s0;
      }
      function peg$parseImportsList() {
        let s0, s1, s2, s3, s4, s5, s6;
        s0 = peg$currPos;
        s1 = [];
        s2 = peg$parseImportSpecifier();
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          s2 = peg$currPos;
          s3 = peg$currPos;
          s4 = peg$parse__();
          if (input.charCodeAt(peg$currPos) === 44) {
            s5 = peg$c2;
            peg$currPos++;
          } else {
            s5 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e3);
            }
          }
          if (s5 !== peg$FAILED) {
            s6 = peg$parse__();
            s4 = [s4, s5, s6];
            s3 = s4;
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
          if (s3 !== peg$FAILED) {
            s3 = peg$parseImportSpecifier();
            if (s3 === peg$FAILED) {
              peg$currPos = s2;
              s2 = peg$FAILED;
            } else {
              s2 = s3;
            }
          } else {
            s2 = s3;
          }
        }
        if (s1.length < 1) {
          peg$currPos = s0;
          s0 = peg$FAILED;
        } else {
          s0 = s1;
        }
        return s0;
      }
      function peg$parseImportSpecifier() {
        let s0, s1, s2, s3, s4, s5;
        s0 = peg$currPos;
        s1 = peg$parseModuleExportName();
        if (s1 !== peg$FAILED) {
          s2 = peg$parse__();
          if (input.substr(peg$currPos, 2) === peg$c4) {
            s3 = peg$c4;
            peg$currPos += 2;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e5);
            }
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parse__();
            s5 = peg$parseImportedBinding();
            if (s5 !== peg$FAILED) {
              peg$savedPos = s0;
              s0 = peg$f10(s1, s5);
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          s1 = peg$parseImportedBinding();
          if (s1 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$f11(s1);
          }
          s0 = s1;
        }
        return s0;
      }
      function peg$parseModuleSpecifier() {
        let s0, s1;
        s0 = peg$currPos;
        s1 = peg$parseStringLiteral();
        if (s1 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$f12(s1);
        }
        s0 = s1;
        return s0;
      }
      function peg$parseImportedBinding() {
        let s0, s1;
        s0 = peg$currPos;
        s1 = peg$parseBindingIdentifier();
        if (s1 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$f13(s1);
        }
        s0 = s1;
        return s0;
      }
      function peg$parseModuleExportName() {
        let s0, s1;
        s0 = peg$parseIdentifierName();
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          s1 = peg$parseStringLiteral();
          if (s1 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$f14(s1);
          }
          s0 = s1;
        }
        return s0;
      }
      function peg$parseBindingIdentifier() {
        let s0, s1;
        s0 = peg$currPos;
        s1 = peg$parseIdentifierName();
        if (s1 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$f15(s1);
        }
        s0 = s1;
        return s0;
      }
      function peg$parseTopLevelInitializer() {
        let s0, s1, s2, s3, s4;
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 123) {
          s1 = peg$c5;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e6);
          }
        }
        if (s1 !== peg$FAILED) {
          s2 = peg$parseCodeBlock();
          if (s2 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 125) {
              s3 = peg$c6;
              peg$currPos++;
            } else {
              s3 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$e7);
              }
            }
            if (s3 !== peg$FAILED) {
              s4 = peg$parseEOS();
              if (s4 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f16(s2);
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
        return s0;
      }
      function peg$parseInitializer() {
        let s0, s1, s2;
        s0 = peg$currPos;
        s1 = peg$parseCodeBlock();
        if (s1 !== peg$FAILED) {
          s2 = peg$parseEOS();
          if (s2 !== peg$FAILED) {
            peg$savedPos = s0;
            s0 = peg$f17(s1);
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
        return s0;
      }
      function peg$parseRule() {
        let s0, s1, s2, s3, s4, s5, s6, s7;
        s0 = peg$currPos;
        s1 = peg$parseIdentifierName();
        if (s1 !== peg$FAILED) {
          s2 = peg$parse__();
          s3 = peg$currPos;
          s4 = peg$parseStringLiteral();
          if (s4 !== peg$FAILED) {
            s5 = peg$parse__();
            s3 = s4;
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
          if (s3 === peg$FAILED) {
            s3 = null;
          }
          if (input.charCodeAt(peg$currPos) === 61) {
            s4 = peg$c8;
            peg$currPos++;
          } else {
            s4 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e9);
            }
          }
          if (s4 !== peg$FAILED) {
            s5 = peg$parse__();
            s6 = peg$parseChoiceExpression();
            if (s6 !== peg$FAILED) {
              s7 = peg$parseEOS();
              if (s7 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f18(s1, s3, s6);
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
        return s0;
      }
      function peg$parseChoiceExpression() {
        let s0, s1, s2, s3, s4, s5, s6, s7;
        s0 = peg$currPos;
        s1 = peg$parseActionExpression();
        if (s1 !== peg$FAILED) {
          s2 = [];
          s3 = peg$currPos;
          s4 = peg$parse__();
          if (input.charCodeAt(peg$currPos) === 47) {
            s5 = peg$c9;
            peg$currPos++;
          } else {
            s5 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e10);
            }
          }
          if (s5 !== peg$FAILED) {
            s6 = peg$parse__();
            s7 = peg$parseActionExpression();
            if (s7 !== peg$FAILED) {
              s3 = s7;
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
          while (s3 !== peg$FAILED) {
            s2.push(s3);
            s3 = peg$currPos;
            s4 = peg$parse__();
            if (input.charCodeAt(peg$currPos) === 47) {
              s5 = peg$c9;
              peg$currPos++;
            } else {
              s5 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$e10);
              }
            }
            if (s5 !== peg$FAILED) {
              s6 = peg$parse__();
              s7 = peg$parseActionExpression();
              if (s7 !== peg$FAILED) {
                s3 = s7;
              } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          }
          peg$savedPos = s0;
          s0 = peg$f19(s1, s2);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
        return s0;
      }
      function peg$parseActionExpression() {
        let s0, s1, s2, s3, s4;
        s0 = peg$currPos;
        s1 = peg$parseSequenceExpression();
        if (s1 !== peg$FAILED) {
          s2 = peg$currPos;
          s3 = peg$parse__();
          s4 = peg$parseCodeBlock();
          if (s4 !== peg$FAILED) {
            s2 = s4;
          } else {
            peg$currPos = s2;
            s2 = peg$FAILED;
          }
          if (s2 === peg$FAILED) {
            s2 = null;
          }
          peg$savedPos = s0;
          s0 = peg$f20(s1, s2);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
        return s0;
      }
      function peg$parseSequenceExpression() {
        let s0, s1, s2, s3, s4, s5;
        s0 = peg$currPos;
        s1 = peg$parseLabeledExpression();
        if (s1 !== peg$FAILED) {
          s2 = [];
          s3 = peg$currPos;
          s4 = peg$parse__();
          s5 = peg$parseLabeledExpression();
          if (s5 !== peg$FAILED) {
            s3 = s5;
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
          while (s3 !== peg$FAILED) {
            s2.push(s3);
            s3 = peg$currPos;
            s4 = peg$parse__();
            s5 = peg$parseLabeledExpression();
            if (s5 !== peg$FAILED) {
              s3 = s5;
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          }
          peg$savedPos = s0;
          s0 = peg$f21(s1, s2);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
        return s0;
      }
      function peg$parseLabeledExpression() {
        let s0, s1, s2, s3;
        s0 = peg$currPos;
        s1 = peg$parsePluck();
        if (s1 !== peg$FAILED) {
          s2 = peg$parseLabelColon();
          if (s2 === peg$FAILED) {
            s2 = null;
          }
          s3 = peg$parsePrefixedExpression();
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s0 = peg$f22(s1, s2, s3);
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          s1 = peg$parseLabelColon();
          if (s1 !== peg$FAILED) {
            s2 = peg$parsePrefixedExpression();
            if (s2 !== peg$FAILED) {
              peg$savedPos = s0;
              s0 = peg$f23(s1, s2);
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
          if (s0 === peg$FAILED) {
            s0 = peg$parsePrefixedExpression();
          }
        }
        return s0;
      }
      function peg$parsePluck() {
        let s0, s1;
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 64) {
          s1 = peg$c10;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e11);
          }
        }
        if (s1 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$f24();
        }
        s0 = s1;
        return s0;
      }
      function peg$parseLabelColon() {
        let s0, s1, s2, s3, s4;
        s0 = peg$currPos;
        s1 = peg$parseIdentifierName();
        if (s1 !== peg$FAILED) {
          s2 = peg$parse__();
          if (input.charCodeAt(peg$currPos) === 58) {
            s3 = peg$c11;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e12);
            }
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parse__();
            peg$savedPos = s0;
            s0 = peg$f25(s1);
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
        return s0;
      }
      function peg$parsePrefixedExpression() {
        let s0, s1, s2, s3;
        s0 = peg$currPos;
        s1 = peg$parsePrefixedOperator();
        if (s1 !== peg$FAILED) {
          s2 = peg$parse__();
          s3 = peg$parseSuffixedExpression();
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s0 = peg$f26(s1, s3);
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
        if (s0 === peg$FAILED) {
          s0 = peg$parseSuffixedExpression();
        }
        return s0;
      }
      function peg$parsePrefixedOperator() {
        let s0;
        s0 = input.charAt(peg$currPos);
        if (peg$r0.test(s0)) {
          peg$currPos++;
        } else {
          s0 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e13);
          }
        }
        return s0;
      }
      function peg$parseSuffixedExpression() {
        let s0, s1, s2, s3;
        s0 = peg$currPos;
        s1 = peg$parsePrimaryExpression();
        if (s1 !== peg$FAILED) {
          s2 = peg$parse__();
          s3 = peg$parseSuffixedOperator();
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s0 = peg$f27(s1, s3);
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
        if (s0 === peg$FAILED) {
          s0 = peg$parseRepeatedExpression();
          if (s0 === peg$FAILED) {
            s0 = peg$parsePrimaryExpression();
          }
        }
        return s0;
      }
      function peg$parseSuffixedOperator() {
        let s0;
        s0 = input.charAt(peg$currPos);
        if (peg$r1.test(s0)) {
          peg$currPos++;
        } else {
          s0 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e14);
          }
        }
        return s0;
      }
      function peg$parseRepeatedExpression() {
        let s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11;
        s0 = peg$currPos;
        s1 = peg$parsePrimaryExpression();
        if (s1 !== peg$FAILED) {
          s2 = peg$parse__();
          if (input.charCodeAt(peg$currPos) === 124) {
            s3 = peg$c12;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e15);
            }
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parse__();
            s5 = peg$parseBoundaries();
            if (s5 !== peg$FAILED) {
              s6 = peg$parse__();
              s7 = peg$currPos;
              if (input.charCodeAt(peg$currPos) === 44) {
                s8 = peg$c2;
                peg$currPos++;
              } else {
                s8 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e3);
                }
              }
              if (s8 !== peg$FAILED) {
                s9 = peg$parse__();
                s10 = peg$parseChoiceExpression();
                if (s10 !== peg$FAILED) {
                  s11 = peg$parse__();
                  s7 = s10;
                } else {
                  peg$currPos = s7;
                  s7 = peg$FAILED;
                }
              } else {
                peg$currPos = s7;
                s7 = peg$FAILED;
              }
              if (s7 === peg$FAILED) {
                s7 = null;
              }
              if (input.charCodeAt(peg$currPos) === 124) {
                s8 = peg$c12;
                peg$currPos++;
              } else {
                s8 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e15);
                }
              }
              if (s8 !== peg$FAILED) {
                peg$savedPos = s0;
                s0 = peg$f28(s1, s5, s7);
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
        return s0;
      }
      function peg$parseBoundaries() {
        let s0, s1, s2, s3, s4, s5;
        s0 = peg$currPos;
        s1 = peg$parseBoundary();
        if (s1 === peg$FAILED) {
          s1 = null;
        }
        s2 = peg$parse__();
        if (input.substr(peg$currPos, 2) === peg$c13) {
          s3 = peg$c13;
          peg$currPos += 2;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e16);
          }
        }
        if (s3 !== peg$FAILED) {
          s4 = peg$parse__();
          s5 = peg$parseBoundary();
          if (s5 === peg$FAILED) {
            s5 = null;
          }
          peg$savedPos = s0;
          s0 = peg$f29(s1, s5);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          s1 = peg$parseBoundary();
          if (s1 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$f30(s1);
          }
          s0 = s1;
        }
        return s0;
      }
      function peg$parseBoundary() {
        let s0, s1;
        s0 = peg$currPos;
        s1 = peg$parseInteger();
        if (s1 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$f31(s1);
        }
        s0 = s1;
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          s1 = peg$parseIdentifierName();
          if (s1 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$f32(s1);
          }
          s0 = s1;
          if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            s1 = peg$parseCodeBlock();
            if (s1 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$f33(s1);
            }
            s0 = s1;
          }
        }
        return s0;
      }
      function peg$parsePrimaryExpression() {
        let s0, s1, s2, s3, s4, s5;
        s0 = peg$parseLiteralMatcher();
        if (s0 === peg$FAILED) {
          s0 = peg$parseCharacterClassMatcher();
          if (s0 === peg$FAILED) {
            s0 = peg$parseAnyMatcher();
            if (s0 === peg$FAILED) {
              s0 = peg$parseRuleReferenceExpression();
              if (s0 === peg$FAILED) {
                s0 = peg$parseSemanticPredicateExpression();
                if (s0 === peg$FAILED) {
                  s0 = peg$currPos;
                  if (input.charCodeAt(peg$currPos) === 40) {
                    s1 = peg$c14;
                    peg$currPos++;
                  } else {
                    s1 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e17);
                    }
                  }
                  if (s1 !== peg$FAILED) {
                    s2 = peg$parse__();
                    s3 = peg$parseChoiceExpression();
                    if (s3 !== peg$FAILED) {
                      s4 = peg$parse__();
                      if (input.charCodeAt(peg$currPos) === 41) {
                        s5 = peg$c15;
                        peg$currPos++;
                      } else {
                        s5 = peg$FAILED;
                        if (peg$silentFails === 0) {
                          peg$fail(peg$e18);
                        }
                      }
                      if (s5 !== peg$FAILED) {
                        peg$savedPos = s0;
                        s0 = peg$f34(s3);
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                }
              }
            }
          }
        }
        return s0;
      }
      function peg$parseRuleReferenceExpression() {
        let s0, s1, s2, s3, s4, s5, s6, s7;
        s0 = peg$currPos;
        s1 = peg$parseIdentifierName();
        if (s1 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 46) {
            s2 = peg$c16;
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e19);
            }
          }
          if (s2 !== peg$FAILED) {
            s3 = peg$parseIdentifierName();
            if (s3 !== peg$FAILED) {
              peg$savedPos = s0;
              s0 = peg$f35(s1, s3);
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          s1 = peg$parseIdentifierName();
          if (s1 !== peg$FAILED) {
            s2 = peg$currPos;
            peg$silentFails++;
            s3 = peg$currPos;
            s4 = peg$parse__();
            s5 = peg$currPos;
            s6 = peg$parseStringLiteral();
            if (s6 !== peg$FAILED) {
              s7 = peg$parse__();
              s6 = [s6, s7];
              s5 = s6;
            } else {
              peg$currPos = s5;
              s5 = peg$FAILED;
            }
            if (s5 === peg$FAILED) {
              s5 = null;
            }
            if (input.charCodeAt(peg$currPos) === 61) {
              s6 = peg$c8;
              peg$currPos++;
            } else {
              s6 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$e9);
              }
            }
            if (s6 !== peg$FAILED) {
              s4 = [s4, s5, s6];
              s3 = s4;
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
            peg$silentFails--;
            if (s3 === peg$FAILED) {
              s2 = void 0;
            } else {
              peg$currPos = s2;
              s2 = peg$FAILED;
            }
            if (s2 !== peg$FAILED) {
              peg$savedPos = s0;
              s0 = peg$f36(s1);
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        }
        return s0;
      }
      function peg$parseSemanticPredicateExpression() {
        let s0, s1, s2, s3;
        s0 = peg$currPos;
        s1 = peg$parseSemanticPredicateOperator();
        if (s1 !== peg$FAILED) {
          s2 = peg$parse__();
          s3 = peg$parseCodeBlock();
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s0 = peg$f37(s1, s3);
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
        return s0;
      }
      function peg$parseSemanticPredicateOperator() {
        let s0;
        s0 = input.charAt(peg$currPos);
        if (peg$r2.test(s0)) {
          peg$currPos++;
        } else {
          s0 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e20);
          }
        }
        return s0;
      }
      function peg$parseSourceCharacter() {
        let s0;
        s0 = peg$parseSourceCharacterLow();
        if (s0 === peg$FAILED) {
          s0 = peg$parseSourceCharacterHigh();
        }
        return s0;
      }
      function peg$parseSourceCharacterLow() {
        let s0;
        s0 = input.charAt(peg$currPos);
        if (peg$r3.test(s0)) {
          peg$currPos++;
        } else {
          s0 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e21);
          }
        }
        return s0;
      }
      function peg$parseSourceCharacterHigh() {
        let s0, s1, s2, s3;
        s0 = peg$currPos;
        s1 = peg$currPos;
        s2 = input.charAt(peg$currPos);
        if (peg$r4.test(s2)) {
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e22);
          }
        }
        if (s2 !== peg$FAILED) {
          s3 = input.charAt(peg$currPos);
          if (peg$r5.test(s3)) {
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e23);
            }
          }
          if (s3 !== peg$FAILED) {
            s2 = [s2, s3];
            s1 = s2;
          } else {
            peg$currPos = s1;
            s1 = peg$FAILED;
          }
        } else {
          peg$currPos = s1;
          s1 = peg$FAILED;
        }
        if (s1 !== peg$FAILED) {
          s0 = input.substring(s0, peg$currPos);
        } else {
          s0 = s1;
        }
        if (s0 === peg$FAILED) {
          s0 = input.charAt(peg$currPos);
          if (peg$r6.test(s0)) {
            peg$currPos++;
          } else {
            s0 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e24);
            }
          }
        }
        return s0;
      }
      function peg$parseWhiteSpace() {
        let s0, s1;
        peg$silentFails++;
        s0 = peg$getUnicode();
        if (peg$r7.test(s0)) {
          peg$currPos += s0.length;
        } else {
          s0 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e26);
          }
        }
        peg$silentFails--;
        if (s0 === peg$FAILED) {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e25);
          }
        }
        return s0;
      }
      function peg$parseLineTerminator() {
        let s0;
        s0 = input.charAt(peg$currPos);
        if (peg$r8.test(s0)) {
          peg$currPos++;
        } else {
          s0 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e27);
          }
        }
        return s0;
      }
      function peg$parseLineTerminatorSequence() {
        let s0, s1;
        peg$silentFails++;
        if (input.charCodeAt(peg$currPos) === 10) {
          s0 = peg$c17;
          peg$currPos++;
        } else {
          s0 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e29);
          }
        }
        if (s0 === peg$FAILED) {
          if (input.substr(peg$currPos, 2) === peg$c18) {
            s0 = peg$c18;
            peg$currPos += 2;
          } else {
            s0 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e30);
            }
          }
          if (s0 === peg$FAILED) {
            s0 = input.charAt(peg$currPos);
            if (peg$r9.test(s0)) {
              peg$currPos++;
            } else {
              s0 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$e31);
              }
            }
          }
        }
        peg$silentFails--;
        if (s0 === peg$FAILED) {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e28);
          }
        }
        return s0;
      }
      function peg$parseComment() {
        let s0, s1;
        peg$silentFails++;
        s0 = peg$parseMultiLineComment();
        if (s0 === peg$FAILED) {
          s0 = peg$parseSingleLineComment();
        }
        peg$silentFails--;
        if (s0 === peg$FAILED) {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e32);
          }
        }
        return s0;
      }
      function peg$parseMultiLineComment() {
        let s0, s1, s2, s3, s4, s5;
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 2) === peg$c19) {
          s1 = peg$c19;
          peg$currPos += 2;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e33);
          }
        }
        if (s1 !== peg$FAILED) {
          s2 = [];
          s3 = peg$currPos;
          s4 = peg$currPos;
          peg$silentFails++;
          if (input.substr(peg$currPos, 2) === peg$c20) {
            s5 = peg$c20;
            peg$currPos += 2;
          } else {
            s5 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e34);
            }
          }
          peg$silentFails--;
          if (s5 === peg$FAILED) {
            s4 = void 0;
          } else {
            peg$currPos = s4;
            s4 = peg$FAILED;
          }
          if (s4 !== peg$FAILED) {
            s5 = peg$parseSourceCharacter();
            if (s5 !== peg$FAILED) {
              s4 = [s4, s5];
              s3 = s4;
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
          while (s3 !== peg$FAILED) {
            s2.push(s3);
            s3 = peg$currPos;
            s4 = peg$currPos;
            peg$silentFails++;
            if (input.substr(peg$currPos, 2) === peg$c20) {
              s5 = peg$c20;
              peg$currPos += 2;
            } else {
              s5 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$e34);
              }
            }
            peg$silentFails--;
            if (s5 === peg$FAILED) {
              s4 = void 0;
            } else {
              peg$currPos = s4;
              s4 = peg$FAILED;
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parseSourceCharacter();
              if (s5 !== peg$FAILED) {
                s4 = [s4, s5];
                s3 = s4;
              } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          }
          if (input.substr(peg$currPos, 2) === peg$c20) {
            s3 = peg$c20;
            peg$currPos += 2;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e34);
            }
          }
          if (s3 !== peg$FAILED) {
            s1 = [s1, s2, s3];
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
        return s0;
      }
      function peg$parseMultiLineCommentNoLineTerminator() {
        let s0, s1, s2, s3, s4, s5;
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 2) === peg$c19) {
          s1 = peg$c19;
          peg$currPos += 2;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e33);
          }
        }
        if (s1 !== peg$FAILED) {
          s2 = [];
          s3 = peg$currPos;
          s4 = peg$currPos;
          peg$silentFails++;
          if (input.substr(peg$currPos, 2) === peg$c20) {
            s5 = peg$c20;
            peg$currPos += 2;
          } else {
            s5 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e34);
            }
          }
          if (s5 === peg$FAILED) {
            s5 = peg$parseLineTerminator();
          }
          peg$silentFails--;
          if (s5 === peg$FAILED) {
            s4 = void 0;
          } else {
            peg$currPos = s4;
            s4 = peg$FAILED;
          }
          if (s4 !== peg$FAILED) {
            s5 = peg$parseSourceCharacter();
            if (s5 !== peg$FAILED) {
              s4 = [s4, s5];
              s3 = s4;
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
          while (s3 !== peg$FAILED) {
            s2.push(s3);
            s3 = peg$currPos;
            s4 = peg$currPos;
            peg$silentFails++;
            if (input.substr(peg$currPos, 2) === peg$c20) {
              s5 = peg$c20;
              peg$currPos += 2;
            } else {
              s5 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$e34);
              }
            }
            if (s5 === peg$FAILED) {
              s5 = peg$parseLineTerminator();
            }
            peg$silentFails--;
            if (s5 === peg$FAILED) {
              s4 = void 0;
            } else {
              peg$currPos = s4;
              s4 = peg$FAILED;
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parseSourceCharacter();
              if (s5 !== peg$FAILED) {
                s4 = [s4, s5];
                s3 = s4;
              } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          }
          if (input.substr(peg$currPos, 2) === peg$c20) {
            s3 = peg$c20;
            peg$currPos += 2;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e34);
            }
          }
          if (s3 !== peg$FAILED) {
            s1 = [s1, s2, s3];
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
        return s0;
      }
      function peg$parseSingleLineComment() {
        let s0, s1, s2, s3, s4, s5;
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 2) === peg$c21) {
          s1 = peg$c21;
          peg$currPos += 2;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e35);
          }
        }
        if (s1 !== peg$FAILED) {
          s2 = [];
          s3 = peg$currPos;
          s4 = peg$currPos;
          peg$silentFails++;
          s5 = peg$parseLineTerminator();
          peg$silentFails--;
          if (s5 === peg$FAILED) {
            s4 = void 0;
          } else {
            peg$currPos = s4;
            s4 = peg$FAILED;
          }
          if (s4 !== peg$FAILED) {
            s5 = peg$parseSourceCharacter();
            if (s5 !== peg$FAILED) {
              s4 = [s4, s5];
              s3 = s4;
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
          while (s3 !== peg$FAILED) {
            s2.push(s3);
            s3 = peg$currPos;
            s4 = peg$currPos;
            peg$silentFails++;
            s5 = peg$parseLineTerminator();
            peg$silentFails--;
            if (s5 === peg$FAILED) {
              s4 = void 0;
            } else {
              peg$currPos = s4;
              s4 = peg$FAILED;
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parseSourceCharacter();
              if (s5 !== peg$FAILED) {
                s4 = [s4, s5];
                s3 = s4;
              } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          }
          s1 = [s1, s2];
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
        return s0;
      }
      function peg$parseIdentifierName() {
        let s0, s1, s2, s3;
        peg$silentFails++;
        s0 = peg$currPos;
        s1 = peg$parseIdentifierStart();
        if (s1 !== peg$FAILED) {
          s2 = [];
          s3 = peg$parseIdentifierPart();
          while (s3 !== peg$FAILED) {
            s2.push(s3);
            s3 = peg$parseIdentifierPart();
          }
          peg$savedPos = s0;
          s0 = peg$f38(s1, s2);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
        peg$silentFails--;
        if (s0 === peg$FAILED) {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e36);
          }
        }
        return s0;
      }
      function peg$parseIdentifierStart() {
        let s0, s1, s2;
        s0 = peg$getUnicode();
        if (peg$r10.test(s0)) {
          peg$currPos += s0.length;
        } else {
          s0 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e37);
          }
        }
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          if (input.charCodeAt(peg$currPos) === 92) {
            s1 = peg$c22;
            peg$currPos++;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e38);
            }
          }
          if (s1 !== peg$FAILED) {
            s2 = peg$parseUnicodeEscapeSequence();
            if (s2 !== peg$FAILED) {
              s0 = s2;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        }
        return s0;
      }
      function peg$parseIdentifierPart() {
        let s0;
        s0 = peg$getUnicode();
        if (peg$r11.test(s0)) {
          peg$currPos += s0.length;
        } else {
          s0 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e39);
          }
        }
        return s0;
      }
      function peg$parseLiteralMatcher() {
        let s0, s1, s2;
        peg$silentFails++;
        s0 = peg$currPos;
        s1 = peg$parseStringLiteral();
        if (s1 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 105) {
            s2 = peg$c23;
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e41);
            }
          }
          if (s2 === peg$FAILED) {
            s2 = null;
          }
          peg$savedPos = s0;
          s0 = peg$f39(s1, s2);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
        peg$silentFails--;
        if (s0 === peg$FAILED) {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e40);
          }
        }
        return s0;
      }
      function peg$parseStringLiteral() {
        let s0, s1, s2, s3;
        peg$silentFails++;
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 34) {
          s1 = peg$c24;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e43);
          }
        }
        if (s1 !== peg$FAILED) {
          s2 = [];
          s3 = peg$parseDoubleStringCharacter();
          while (s3 !== peg$FAILED) {
            s2.push(s3);
            s3 = peg$parseDoubleStringCharacter();
          }
          if (input.charCodeAt(peg$currPos) === 34) {
            s3 = peg$c24;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e43);
            }
          }
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s0 = peg$f40(s2);
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          if (input.charCodeAt(peg$currPos) === 39) {
            s1 = peg$c25;
            peg$currPos++;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e44);
            }
          }
          if (s1 !== peg$FAILED) {
            s2 = [];
            s3 = peg$parseSingleStringCharacter();
            while (s3 !== peg$FAILED) {
              s2.push(s3);
              s3 = peg$parseSingleStringCharacter();
            }
            if (input.charCodeAt(peg$currPos) === 39) {
              s3 = peg$c25;
              peg$currPos++;
            } else {
              s3 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$e44);
              }
            }
            if (s3 !== peg$FAILED) {
              peg$savedPos = s0;
              s0 = peg$f41(s2);
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        }
        peg$silentFails--;
        if (s0 === peg$FAILED) {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e42);
          }
        }
        return s0;
      }
      function peg$parseDoubleStringCharacter() {
        let s0, s1, s2, s3;
        s0 = peg$currPos;
        s1 = peg$currPos;
        s2 = peg$currPos;
        peg$silentFails++;
        s3 = input.charAt(peg$currPos);
        if (peg$r12.test(s3)) {
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e45);
          }
        }
        peg$silentFails--;
        if (s3 === peg$FAILED) {
          s2 = void 0;
        } else {
          peg$currPos = s2;
          s2 = peg$FAILED;
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parseSourceCharacter();
          if (s3 !== peg$FAILED) {
            s2 = [s2, s3];
            s1 = s2;
          } else {
            peg$currPos = s1;
            s1 = peg$FAILED;
          }
        } else {
          peg$currPos = s1;
          s1 = peg$FAILED;
        }
        if (s1 !== peg$FAILED) {
          s0 = input.substring(s0, peg$currPos);
        } else {
          s0 = s1;
        }
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          if (input.charCodeAt(peg$currPos) === 92) {
            s1 = peg$c22;
            peg$currPos++;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e38);
            }
          }
          if (s1 !== peg$FAILED) {
            s2 = peg$parseEscapeSequence();
            if (s2 !== peg$FAILED) {
              s0 = s2;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
          if (s0 === peg$FAILED) {
            s0 = peg$parseLineContinuation();
          }
        }
        return s0;
      }
      function peg$parseSingleStringCharacter() {
        let s0, s1, s2, s3;
        s0 = peg$currPos;
        s1 = peg$currPos;
        s2 = peg$currPos;
        peg$silentFails++;
        s3 = input.charAt(peg$currPos);
        if (peg$r13.test(s3)) {
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e46);
          }
        }
        peg$silentFails--;
        if (s3 === peg$FAILED) {
          s2 = void 0;
        } else {
          peg$currPos = s2;
          s2 = peg$FAILED;
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parseSourceCharacter();
          if (s3 !== peg$FAILED) {
            s2 = [s2, s3];
            s1 = s2;
          } else {
            peg$currPos = s1;
            s1 = peg$FAILED;
          }
        } else {
          peg$currPos = s1;
          s1 = peg$FAILED;
        }
        if (s1 !== peg$FAILED) {
          s0 = input.substring(s0, peg$currPos);
        } else {
          s0 = s1;
        }
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          if (input.charCodeAt(peg$currPos) === 92) {
            s1 = peg$c22;
            peg$currPos++;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e38);
            }
          }
          if (s1 !== peg$FAILED) {
            s2 = peg$parseEscapeSequence();
            if (s2 !== peg$FAILED) {
              s0 = s2;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
          if (s0 === peg$FAILED) {
            s0 = peg$parseLineContinuation();
          }
        }
        return s0;
      }
      function peg$parseCharacterClassMatcher() {
        let s0, s1, s2, s3, s4, s5;
        peg$silentFails++;
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 91) {
          s1 = peg$c26;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e48);
          }
        }
        if (s1 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 94) {
            s2 = peg$c27;
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e49);
            }
          }
          if (s2 === peg$FAILED) {
            s2 = null;
          }
          s3 = [];
          s4 = peg$parseAtomEscape();
          if (s4 === peg$FAILED) {
            s4 = peg$parseClassCharacterRange();
            if (s4 === peg$FAILED) {
              s4 = peg$parseClassCharacter();
            }
          }
          while (s4 !== peg$FAILED) {
            s3.push(s4);
            s4 = peg$parseAtomEscape();
            if (s4 === peg$FAILED) {
              s4 = peg$parseClassCharacterRange();
              if (s4 === peg$FAILED) {
                s4 = peg$parseClassCharacter();
              }
            }
          }
          if (input.charCodeAt(peg$currPos) === 93) {
            s4 = peg$c28;
            peg$currPos++;
          } else {
            s4 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e50);
            }
          }
          if (s4 !== peg$FAILED) {
            s5 = peg$parseClassFlags();
            peg$savedPos = s0;
            s0 = peg$f42(s2, s3, s5);
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
        peg$silentFails--;
        if (s0 === peg$FAILED) {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e47);
          }
        }
        return s0;
      }
      function peg$parseAtomEscape() {
        let s0, s1, s2;
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 92) {
          s1 = peg$c22;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e38);
          }
        }
        if (s1 !== peg$FAILED) {
          s2 = peg$parseCharacterClassEscape();
          if (s2 !== peg$FAILED) {
            s0 = s2;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
        return s0;
      }
      function peg$parseCharacterClassEscape() {
        let s0, s1, s2, s3, s4, s5, s6;
        s0 = peg$currPos;
        s1 = peg$currPos;
        s2 = peg$currPos;
        s3 = input.charAt(peg$currPos);
        if (s3.toLowerCase() === peg$c29) {
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e51);
          }
        }
        if (s3 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 123) {
            s4 = peg$c5;
            peg$currPos++;
          } else {
            s4 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e6);
            }
          }
          if (s4 !== peg$FAILED) {
            s5 = peg$parseUnicodePropertyValueExpression();
            if (s5 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 125) {
                s6 = peg$c6;
                peg$currPos++;
              } else {
                s6 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e7);
                }
              }
              if (s6 !== peg$FAILED) {
                s3 = [s3, s4, s5, s6];
                s2 = s3;
              } else {
                peg$currPos = s2;
                s2 = peg$FAILED;
              }
            } else {
              peg$currPos = s2;
              s2 = peg$FAILED;
            }
          } else {
            peg$currPos = s2;
            s2 = peg$FAILED;
          }
        } else {
          peg$currPos = s2;
          s2 = peg$FAILED;
        }
        if (s2 !== peg$FAILED) {
          s1 = input.substring(s1, peg$currPos);
        } else {
          s1 = s2;
        }
        if (s1 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$f43(s1);
        }
        s0 = s1;
        return s0;
      }
      function peg$parseUnicodePropertyValueExpression() {
        let s0, s1, s2, s3;
        s0 = peg$currPos;
        s1 = peg$parseUnicodePropertyName();
        if (s1 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 61) {
            s2 = peg$c8;
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e9);
            }
          }
          if (s2 !== peg$FAILED) {
            s3 = peg$parseUnicodePropertyValue();
            if (s3 !== peg$FAILED) {
              s1 = [s1, s2, s3];
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
        if (s0 === peg$FAILED) {
          s0 = peg$parseLoneUnicodePropertyNameOrValue();
        }
        return s0;
      }
      function peg$parseUnicodePropertyName() {
        let s0, s1, s2;
        s0 = peg$currPos;
        s1 = [];
        s2 = peg$parseUnicodePropertyNameCharacter();
        if (s2 !== peg$FAILED) {
          while (s2 !== peg$FAILED) {
            s1.push(s2);
            s2 = peg$parseUnicodePropertyNameCharacter();
          }
        } else {
          s1 = peg$FAILED;
        }
        if (s1 !== peg$FAILED) {
          s0 = input.substring(s0, peg$currPos);
        } else {
          s0 = s1;
        }
        return s0;
      }
      function peg$parseUnicodePropertyValue() {
        let s0, s1, s2;
        s0 = peg$currPos;
        s1 = [];
        s2 = peg$parseUnicodePropertyValueCharacter();
        if (s2 !== peg$FAILED) {
          while (s2 !== peg$FAILED) {
            s1.push(s2);
            s2 = peg$parseUnicodePropertyValueCharacter();
          }
        } else {
          s1 = peg$FAILED;
        }
        if (s1 !== peg$FAILED) {
          s0 = input.substring(s0, peg$currPos);
        } else {
          s0 = s1;
        }
        return s0;
      }
      function peg$parseLoneUnicodePropertyNameOrValue() {
        let s0, s1, s2;
        s0 = peg$currPos;
        s1 = [];
        s2 = peg$parseUnicodePropertyValueCharacter();
        if (s2 !== peg$FAILED) {
          while (s2 !== peg$FAILED) {
            s1.push(s2);
            s2 = peg$parseUnicodePropertyValueCharacter();
          }
        } else {
          s1 = peg$FAILED;
        }
        if (s1 !== peg$FAILED) {
          s0 = input.substring(s0, peg$currPos);
        } else {
          s0 = s1;
        }
        return s0;
      }
      function peg$parseUnicodePropertyValueCharacter() {
        let s0;
        s0 = peg$parseUnicodePropertyNameCharacter();
        if (s0 === peg$FAILED) {
          s0 = peg$parseDecimalDigit();
        }
        return s0;
      }
      function peg$parseUnicodePropertyNameCharacter() {
        let s0;
        s0 = peg$parseAsciiLetter();
        if (s0 === peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 95) {
            s0 = peg$c30;
            peg$currPos++;
          } else {
            s0 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e52);
            }
          }
        }
        return s0;
      }
      function peg$parseAsciiLetter() {
        let s0;
        s0 = input.charAt(peg$currPos);
        if (peg$r14.test(s0)) {
          peg$currPos++;
        } else {
          s0 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e53);
          }
        }
        return s0;
      }
      function peg$parseClassFlags() {
        let s0, s1, s2;
        s0 = peg$currPos;
        s1 = [];
        s2 = peg$parseClassFlag();
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          s2 = peg$parseClassFlag();
        }
        peg$savedPos = s0;
        s1 = peg$f44(s1);
        s0 = s1;
        return s0;
      }
      function peg$parseClassFlag() {
        let s0, s1;
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 105) {
          s1 = peg$c23;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e41);
          }
        }
        if (s1 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$f45();
        }
        s0 = s1;
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          if (input.charCodeAt(peg$currPos) === 117) {
            s1 = peg$c31;
            peg$currPos++;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e54);
            }
          }
          if (s1 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$f46();
          }
          s0 = s1;
        }
        return s0;
      }
      function peg$parseClassCharacterRange() {
        let s0, s1, s2, s3;
        s0 = peg$currPos;
        s1 = peg$parseClassCharacter();
        if (s1 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 45) {
            s2 = peg$c32;
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e55);
            }
          }
          if (s2 !== peg$FAILED) {
            s3 = peg$parseClassCharacter();
            if (s3 !== peg$FAILED) {
              peg$savedPos = s0;
              s0 = peg$f47(s1, s3);
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
        return s0;
      }
      function peg$parseClassCharacter() {
        let s0, s1, s2, s3;
        s0 = peg$currPos;
        s1 = peg$currPos;
        s2 = peg$currPos;
        peg$silentFails++;
        s3 = input.charAt(peg$currPos);
        if (peg$r15.test(s3)) {
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e56);
          }
        }
        peg$silentFails--;
        if (s3 === peg$FAILED) {
          s2 = void 0;
        } else {
          peg$currPos = s2;
          s2 = peg$FAILED;
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parseSourceCharacter();
          if (s3 !== peg$FAILED) {
            s2 = [s2, s3];
            s1 = s2;
          } else {
            peg$currPos = s1;
            s1 = peg$FAILED;
          }
        } else {
          peg$currPos = s1;
          s1 = peg$FAILED;
        }
        if (s1 !== peg$FAILED) {
          s0 = input.substring(s0, peg$currPos);
        } else {
          s0 = s1;
        }
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          if (input.charCodeAt(peg$currPos) === 92) {
            s1 = peg$c22;
            peg$currPos++;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e38);
            }
          }
          if (s1 !== peg$FAILED) {
            s2 = peg$parseEscapeSequence();
            if (s2 !== peg$FAILED) {
              s0 = s2;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
          if (s0 === peg$FAILED) {
            s0 = peg$parseLineContinuation();
          }
        }
        return s0;
      }
      function peg$parseLineContinuation() {
        let s0, s1, s2;
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 92) {
          s1 = peg$c22;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e38);
          }
        }
        if (s1 !== peg$FAILED) {
          s2 = peg$parseLineTerminatorSequence();
          if (s2 !== peg$FAILED) {
            peg$savedPos = s0;
            s0 = peg$f48();
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
        return s0;
      }
      function peg$parseEscapeSequence() {
        let s0, s1, s2, s3;
        s0 = peg$parseCharacterEscapeSequence();
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          if (input.charCodeAt(peg$currPos) === 48) {
            s1 = peg$c33;
            peg$currPos++;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e57);
            }
          }
          if (s1 !== peg$FAILED) {
            s2 = peg$currPos;
            peg$silentFails++;
            s3 = peg$parseDecimalDigit();
            peg$silentFails--;
            if (s3 === peg$FAILED) {
              s2 = void 0;
            } else {
              peg$currPos = s2;
              s2 = peg$FAILED;
            }
            if (s2 !== peg$FAILED) {
              peg$savedPos = s0;
              s0 = peg$f49();
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
          if (s0 === peg$FAILED) {
            s0 = peg$parseHexEscapeSequence();
            if (s0 === peg$FAILED) {
              s0 = peg$parseUnicodeEscapeSequence();
            }
          }
        }
        return s0;
      }
      function peg$parseCharacterEscapeSequence() {
        let s0;
        s0 = peg$parseSingleEscapeCharacter();
        if (s0 === peg$FAILED) {
          s0 = peg$parseNonEscapeCharacter();
        }
        return s0;
      }
      function peg$parseSingleEscapeCharacter() {
        let s0, s1;
        s0 = input.charAt(peg$currPos);
        if (peg$r16.test(s0)) {
          peg$currPos++;
        } else {
          s0 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e58);
          }
        }
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          if (input.charCodeAt(peg$currPos) === 98) {
            s1 = peg$c34;
            peg$currPos++;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e59);
            }
          }
          if (s1 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$f50();
          }
          s0 = s1;
          if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 102) {
              s1 = peg$c35;
              peg$currPos++;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$e60);
              }
            }
            if (s1 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$f51();
            }
            s0 = s1;
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              if (input.charCodeAt(peg$currPos) === 110) {
                s1 = peg$c36;
                peg$currPos++;
              } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e61);
                }
              }
              if (s1 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$f52();
              }
              s0 = s1;
              if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                if (input.charCodeAt(peg$currPos) === 114) {
                  s1 = peg$c37;
                  peg$currPos++;
                } else {
                  s1 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$e62);
                  }
                }
                if (s1 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s1 = peg$f53();
                }
                s0 = s1;
                if (s0 === peg$FAILED) {
                  s0 = peg$currPos;
                  if (input.charCodeAt(peg$currPos) === 116) {
                    s1 = peg$c38;
                    peg$currPos++;
                  } else {
                    s1 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e63);
                    }
                  }
                  if (s1 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s1 = peg$f54();
                  }
                  s0 = s1;
                  if (s0 === peg$FAILED) {
                    s0 = peg$currPos;
                    if (input.charCodeAt(peg$currPos) === 118) {
                      s1 = peg$c39;
                      peg$currPos++;
                    } else {
                      s1 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e64);
                      }
                    }
                    if (s1 !== peg$FAILED) {
                      peg$savedPos = s0;
                      s1 = peg$f55();
                    }
                    s0 = s1;
                  }
                }
              }
            }
          }
        }
        return s0;
      }
      function peg$parseNonEscapeCharacter() {
        let s0, s1, s2, s3;
        s0 = peg$currPos;
        s1 = peg$currPos;
        s2 = peg$currPos;
        peg$silentFails++;
        s3 = peg$parseEscapeCharacter();
        if (s3 === peg$FAILED) {
          s3 = peg$parseLineTerminator();
        }
        peg$silentFails--;
        if (s3 === peg$FAILED) {
          s2 = void 0;
        } else {
          peg$currPos = s2;
          s2 = peg$FAILED;
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parseSourceCharacter();
          if (s3 !== peg$FAILED) {
            s2 = [s2, s3];
            s1 = s2;
          } else {
            peg$currPos = s1;
            s1 = peg$FAILED;
          }
        } else {
          peg$currPos = s1;
          s1 = peg$FAILED;
        }
        if (s1 !== peg$FAILED) {
          s0 = input.substring(s0, peg$currPos);
        } else {
          s0 = s1;
        }
        return s0;
      }
      function peg$parseEscapeCharacter() {
        let s0;
        s0 = peg$parseSingleEscapeCharacter();
        if (s0 === peg$FAILED) {
          s0 = input.charAt(peg$currPos);
          if (peg$r17.test(s0)) {
            peg$currPos++;
          } else {
            s0 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e65);
            }
          }
        }
        return s0;
      }
      function peg$parseHexEscapeSequence() {
        let s0, s1, s2, s3, s4, s5;
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 120) {
          s1 = peg$c40;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e66);
          }
        }
        if (s1 !== peg$FAILED) {
          s2 = peg$currPos;
          s3 = peg$currPos;
          s4 = peg$parseHexDigit();
          if (s4 !== peg$FAILED) {
            s5 = peg$parseHexDigit();
            if (s5 !== peg$FAILED) {
              s4 = [s4, s5];
              s3 = s4;
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
          if (s3 !== peg$FAILED) {
            s2 = input.substring(s2, peg$currPos);
          } else {
            s2 = s3;
          }
          if (s2 !== peg$FAILED) {
            peg$savedPos = s0;
            s0 = peg$f56(s2);
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
        return s0;
      }
      function peg$parseUnicodeEscapeSequence() {
        let s0, s1, s2, s3, s4, s5, s6, s7;
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 117) {
          s1 = peg$c31;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e54);
          }
        }
        if (s1 !== peg$FAILED) {
          s2 = peg$currPos;
          s3 = peg$currPos;
          s4 = peg$parseHexDigit();
          if (s4 !== peg$FAILED) {
            s5 = peg$parseHexDigit();
            if (s5 !== peg$FAILED) {
              s6 = peg$parseHexDigit();
              if (s6 !== peg$FAILED) {
                s7 = peg$parseHexDigit();
                if (s7 !== peg$FAILED) {
                  s4 = [s4, s5, s6, s7];
                  s3 = s4;
                } else {
                  peg$currPos = s3;
                  s3 = peg$FAILED;
                }
              } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
          if (s3 !== peg$FAILED) {
            s2 = input.substring(s2, peg$currPos);
          } else {
            s2 = s3;
          }
          if (s2 !== peg$FAILED) {
            peg$savedPos = s0;
            s0 = peg$f57(s2);
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          if (input.charCodeAt(peg$currPos) === 117) {
            s1 = peg$c31;
            peg$currPos++;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e54);
            }
          }
          if (s1 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 123) {
              s2 = peg$c5;
              peg$currPos++;
            } else {
              s2 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$e6);
              }
            }
            if (s2 !== peg$FAILED) {
              s3 = peg$currPos;
              s4 = [];
              s5 = peg$parseHexDigit();
              if (s5 !== peg$FAILED) {
                while (s5 !== peg$FAILED) {
                  s4.push(s5);
                  s5 = peg$parseHexDigit();
                }
              } else {
                s4 = peg$FAILED;
              }
              if (s4 !== peg$FAILED) {
                s3 = input.substring(s3, peg$currPos);
              } else {
                s3 = s4;
              }
              if (s3 !== peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 125) {
                  s4 = peg$c6;
                  peg$currPos++;
                } else {
                  s4 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$e7);
                  }
                }
                if (s4 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s0 = peg$f58(s3);
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        }
        return s0;
      }
      function peg$parseDecimalDigit() {
        let s0;
        s0 = input.charAt(peg$currPos);
        if (peg$r18.test(s0)) {
          peg$currPos++;
        } else {
          s0 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e67);
          }
        }
        return s0;
      }
      function peg$parseHexDigit() {
        let s0;
        s0 = input.charAt(peg$currPos);
        if (peg$r19.test(s0)) {
          peg$currPos++;
        } else {
          s0 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e68);
          }
        }
        return s0;
      }
      function peg$parseAnyMatcher() {
        let s0, s1;
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 46) {
          s1 = peg$c16;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e19);
          }
        }
        if (s1 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$f59();
        }
        s0 = s1;
        return s0;
      }
      function peg$parseCodeBlock() {
        let s0, s1, s2, s3;
        peg$silentFails++;
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 123) {
          s1 = peg$c5;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e6);
          }
        }
        if (s1 !== peg$FAILED) {
          s2 = peg$parseBareCodeBlock();
          if (input.charCodeAt(peg$currPos) === 125) {
            s3 = peg$c6;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e7);
            }
          }
          if (s3 !== peg$FAILED) {
            s0 = s2;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
        peg$silentFails--;
        if (s0 === peg$FAILED) {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e69);
          }
        }
        return s0;
      }
      function peg$parseBareCodeBlock() {
        let s0, s1;
        s0 = peg$currPos;
        s1 = peg$parseCode();
        peg$savedPos = s0;
        s1 = peg$f60(s1);
        s0 = s1;
        return s0;
      }
      function peg$parseCode() {
        let s0, s1, s2, s3, s4, s5;
        s0 = peg$currPos;
        s1 = [];
        s2 = [];
        s3 = peg$currPos;
        s4 = peg$currPos;
        peg$silentFails++;
        s5 = input.charAt(peg$currPos);
        if (peg$r20.test(s5)) {
          peg$currPos++;
        } else {
          s5 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e70);
          }
        }
        peg$silentFails--;
        if (s5 === peg$FAILED) {
          s4 = void 0;
        } else {
          peg$currPos = s4;
          s4 = peg$FAILED;
        }
        if (s4 !== peg$FAILED) {
          s5 = peg$parseSourceCharacter();
          if (s5 !== peg$FAILED) {
            s4 = [s4, s5];
            s3 = s4;
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
        if (s3 !== peg$FAILED) {
          while (s3 !== peg$FAILED) {
            s2.push(s3);
            s3 = peg$currPos;
            s4 = peg$currPos;
            peg$silentFails++;
            s5 = input.charAt(peg$currPos);
            if (peg$r20.test(s5)) {
              peg$currPos++;
            } else {
              s5 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$e70);
              }
            }
            peg$silentFails--;
            if (s5 === peg$FAILED) {
              s4 = void 0;
            } else {
              peg$currPos = s4;
              s4 = peg$FAILED;
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parseSourceCharacter();
              if (s5 !== peg$FAILED) {
                s4 = [s4, s5];
                s3 = s4;
              } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          }
        } else {
          s2 = peg$FAILED;
        }
        if (s2 === peg$FAILED) {
          s2 = peg$currPos;
          if (input.charCodeAt(peg$currPos) === 123) {
            s3 = peg$c5;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e6);
            }
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parseCode();
            if (input.charCodeAt(peg$currPos) === 125) {
              s5 = peg$c6;
              peg$currPos++;
            } else {
              s5 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$e7);
              }
            }
            if (s5 !== peg$FAILED) {
              s3 = [s3, s4, s5];
              s2 = s3;
            } else {
              peg$currPos = s2;
              s2 = peg$FAILED;
            }
          } else {
            peg$currPos = s2;
            s2 = peg$FAILED;
          }
        }
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          s2 = [];
          s3 = peg$currPos;
          s4 = peg$currPos;
          peg$silentFails++;
          s5 = input.charAt(peg$currPos);
          if (peg$r20.test(s5)) {
            peg$currPos++;
          } else {
            s5 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e70);
            }
          }
          peg$silentFails--;
          if (s5 === peg$FAILED) {
            s4 = void 0;
          } else {
            peg$currPos = s4;
            s4 = peg$FAILED;
          }
          if (s4 !== peg$FAILED) {
            s5 = peg$parseSourceCharacter();
            if (s5 !== peg$FAILED) {
              s4 = [s4, s5];
              s3 = s4;
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
          if (s3 !== peg$FAILED) {
            while (s3 !== peg$FAILED) {
              s2.push(s3);
              s3 = peg$currPos;
              s4 = peg$currPos;
              peg$silentFails++;
              s5 = input.charAt(peg$currPos);
              if (peg$r20.test(s5)) {
                peg$currPos++;
              } else {
                s5 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e70);
                }
              }
              peg$silentFails--;
              if (s5 === peg$FAILED) {
                s4 = void 0;
              } else {
                peg$currPos = s4;
                s4 = peg$FAILED;
              }
              if (s4 !== peg$FAILED) {
                s5 = peg$parseSourceCharacter();
                if (s5 !== peg$FAILED) {
                  s4 = [s4, s5];
                  s3 = s4;
                } else {
                  peg$currPos = s3;
                  s3 = peg$FAILED;
                }
              } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
              }
            }
          } else {
            s2 = peg$FAILED;
          }
          if (s2 === peg$FAILED) {
            s2 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 123) {
              s3 = peg$c5;
              peg$currPos++;
            } else {
              s3 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$e6);
              }
            }
            if (s3 !== peg$FAILED) {
              s4 = peg$parseCode();
              if (input.charCodeAt(peg$currPos) === 125) {
                s5 = peg$c6;
                peg$currPos++;
              } else {
                s5 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e7);
                }
              }
              if (s5 !== peg$FAILED) {
                s3 = [s3, s4, s5];
                s2 = s3;
              } else {
                peg$currPos = s2;
                s2 = peg$FAILED;
              }
            } else {
              peg$currPos = s2;
              s2 = peg$FAILED;
            }
          }
        }
        s0 = input.substring(s0, peg$currPos);
        return s0;
      }
      function peg$parseInteger() {
        let s0, s1, s2, s3;
        s0 = peg$currPos;
        s1 = peg$currPos;
        s2 = [];
        s3 = peg$parseDecimalDigit();
        if (s3 !== peg$FAILED) {
          while (s3 !== peg$FAILED) {
            s2.push(s3);
            s3 = peg$parseDecimalDigit();
          }
        } else {
          s2 = peg$FAILED;
        }
        if (s2 !== peg$FAILED) {
          s1 = input.substring(s1, peg$currPos);
        } else {
          s1 = s2;
        }
        if (s1 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$f61(s1);
        }
        s0 = s1;
        return s0;
      }
      function peg$parse__() {
        let s0, s1;
        s0 = [];
        s1 = peg$parseWhiteSpace();
        if (s1 === peg$FAILED) {
          s1 = peg$parseLineTerminatorSequence();
          if (s1 === peg$FAILED) {
            s1 = peg$parseComment();
          }
        }
        while (s1 !== peg$FAILED) {
          s0.push(s1);
          s1 = peg$parseWhiteSpace();
          if (s1 === peg$FAILED) {
            s1 = peg$parseLineTerminatorSequence();
            if (s1 === peg$FAILED) {
              s1 = peg$parseComment();
            }
          }
        }
        return s0;
      }
      function peg$parse_() {
        let s0, s1;
        s0 = [];
        s1 = peg$parseWhiteSpace();
        if (s1 === peg$FAILED) {
          s1 = peg$parseMultiLineCommentNoLineTerminator();
        }
        while (s1 !== peg$FAILED) {
          s0.push(s1);
          s1 = peg$parseWhiteSpace();
          if (s1 === peg$FAILED) {
            s1 = peg$parseMultiLineCommentNoLineTerminator();
          }
        }
        return s0;
      }
      function peg$parseEOS() {
        let s0, s1, s2, s3;
        s0 = [];
        s1 = peg$currPos;
        s2 = peg$parse__();
        if (input.charCodeAt(peg$currPos) === 59) {
          s3 = peg$c1;
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e2);
          }
        }
        if (s3 !== peg$FAILED) {
          s2 = [s2, s3];
          s1 = s2;
        } else {
          peg$currPos = s1;
          s1 = peg$FAILED;
        }
        if (s1 !== peg$FAILED) {
          while (s1 !== peg$FAILED) {
            s0.push(s1);
            s1 = peg$currPos;
            s2 = peg$parse__();
            if (input.charCodeAt(peg$currPos) === 59) {
              s3 = peg$c1;
              peg$currPos++;
            } else {
              s3 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$e2);
              }
            }
            if (s3 !== peg$FAILED) {
              s2 = [s2, s3];
              s1 = s2;
            } else {
              peg$currPos = s1;
              s1 = peg$FAILED;
            }
          }
        } else {
          s0 = peg$FAILED;
        }
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          s1 = peg$parse_();
          s2 = peg$parseSingleLineComment();
          if (s2 === peg$FAILED) {
            s2 = null;
          }
          s3 = peg$parseLineTerminatorSequence();
          if (s3 !== peg$FAILED) {
            s1 = [s1, s2, s3];
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
          if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            s1 = peg$parse__();
            s2 = peg$parseEOF();
            if (s2 !== peg$FAILED) {
              s1 = [s1, s2];
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          }
        }
        return s0;
      }
      function peg$parseEOF() {
        let s0, s1;
        s0 = peg$currPos;
        peg$silentFails++;
        if (input.length > peg$currPos) {
          s1 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e0);
          }
        }
        peg$silentFails--;
        if (s1 === peg$FAILED) {
          s0 = void 0;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
        return s0;
      }
      const reservedWords = new Set(options2.reservedWords);
      peg$result = peg$startRuleFunction();
      const peg$success = peg$result !== peg$FAILED && peg$currPos === input.length;
      function peg$throw() {
        if (peg$result !== peg$FAILED && peg$currPos < input.length) {
          peg$fail(peg$endExpectation());
        }
        throw peg$buildStructuredError(
          peg$maxFailExpected,
          peg$maxFailPos < input.length ? peg$getUnicode(peg$maxFailPos) : null,
          peg$maxFailPos < input.length ? peg$computeLocation(peg$maxFailPos, peg$maxFailPos + 1) : peg$computeLocation(peg$maxFailPos, peg$maxFailPos)
        );
      }
      if (options2.peg$library) {
        return (
          /** @type {any} */
          {
            peg$result,
            peg$currPos,
            peg$FAILED,
            peg$maxFailExpected,
            peg$maxFailPos,
            peg$success,
            peg$throw: peg$success ? void 0 : peg$throw
          }
        );
      }
      if (peg$success) {
        return peg$result;
      } else {
        peg$throw();
      }
    }
    module2.exports = {
      StartRules: ["Grammar", "ImportsAndSource"],
      SyntaxError: peg$SyntaxError,
      parse: peg$parse
    };
  }
});

// ../../node_modules/peggy/lib/compiler/passes/generate-js.js
var require_generate_js = __commonJS({
  "../../node_modules/peggy/lib/compiler/passes/generate-js.js"(exports2, module2) {
    "use strict";
    var asts = require_asts();
    var op = require_opcodes();
    var Stack = require_stack();
    var { version } = require_version();
    var { stringEscape, regexpClassEscape } = require_utils();
    var { SourceNode } = require_source_map();
    var GrammarLocation = require_grammar_location();
    var { parse } = require_parser();
    function toSourceNode(code, location, name) {
      const start = GrammarLocation.offsetStart(location);
      const line = start.line;
      const column = start.column - 1;
      const lines = code.split("\n");
      if (lines.length === 1) {
        return new SourceNode(
          line,
          column,
          String(location.source),
          code,
          name
        );
      }
      return new SourceNode(
        null,
        null,
        String(location.source),
        lines.map((l, i) => new SourceNode(
          line + i,
          i === 0 ? column : 0,
          String(location.source),
          i === lines.length - 1 ? l : [l, "\n"],
          name
        ))
      );
    }
    function wrapInSourceNode(prefix, chunk, location, suffix, name) {
      if (location) {
        const end = GrammarLocation.offsetEnd(location);
        return new SourceNode(null, null, String(location.source), [
          prefix,
          toSourceNode(chunk, location, name),
          // Mark end location with column information otherwise
          // mapping will be always continue to the end of line
          new SourceNode(
            end.line,
            // `source-map` columns are 0-based, peggy columns is 1-based
            end.column - 1,
            String(location.source),
            suffix
          )
        ]);
      }
      return new SourceNode(null, null, null, [prefix, chunk, suffix]);
    }
    function generateJS2(ast2, options2) {
      if (!ast2.literals || !ast2.locations || !ast2.classes || !ast2.expectations || !ast2.functions || !ast2.importedNames) {
        throw new Error(
          "generateJS: generate bytecode was not called."
        );
      }
      const {
        literals,
        locations,
        classes,
        expectations,
        functions,
        importedNames
      } = ast2;
      if (!options2.allowedStartRules) {
        throw new Error(
          "generateJS: options.allowedStartRules was not set."
        );
      }
      const { allowedStartRules } = options2;
      const dependencies = options2.dependencies || {};
      function reIndent(str2, indent = "") {
        const leadingSpace = str2.match(/^\n*([ \t]+)/);
        const body = leadingSpace ? str2.replace(new RegExp(`^${leadingSpace[1]}`, "gm"), indent) : str2;
        return body.replace(/[ \t]+$/, "");
      }
      function indent2(code) {
        let sawEol = true;
        let inSourceNode = 0;
        function helper(code2) {
          if (Array.isArray(code2)) {
            return code2.map((s) => helper(s));
          }
          if (code2 instanceof SourceNode) {
            inSourceNode++;
            code2.children = helper(code2.children);
            inSourceNode--;
            return code2;
          }
          if (sawEol) {
            code2 = code2.replace(/^(.+)$/gm, "  $1");
          } else {
            code2 = code2.replace(/\n(\s*\S)/g, "\n  $1");
          }
          sawEol = !inSourceNode || code2.endsWith("\n");
          return code2;
        }
        return helper(code);
      }
      function l(i) {
        return "peg$c" + i;
      }
      function r(i) {
        return "peg$r" + i;
      }
      function e(i) {
        return "peg$e" + i;
      }
      function f(i) {
        return "peg$f" + i;
      }
      function gi(i) {
        return "peg$import" + i;
      }
      function name(name2) {
        return "peg$parse" + name2;
      }
      function generateTables() {
        function buildLiteral(literal) {
          return '"' + stringEscape(literal) + '"';
        }
        function buildRegexp(cls) {
          return "/^[" + (cls.inverted ? "^" : "") + cls.value.map((part) => Array.isArray(part) ? regexpClassEscape(part[0]) + "-" + regexpClassEscape(part[1]) : regexpClassEscape(part)).join("") + "]/" + (cls.ignoreCase ? "i" : "") + (cls.unicode ? "u" : "");
        }
        function buildExpectation(e2) {
          switch (e2.type) {
            case "rule": {
              return 'peg$otherExpectation("' + stringEscape(e2.value) + '")';
            }
            case "literal": {
              return 'peg$literalExpectation("' + stringEscape(e2.value) + '", ' + e2.ignoreCase + ")";
            }
            case "class": {
              const parts = e2.value.map((part) => Array.isArray(part) ? '["' + stringEscape(part[0]) + '", "' + stringEscape(part[1]) + '"]' : '"' + stringEscape(part) + '"').join(", ");
              return "peg$classExpectation([" + parts + "], " + e2.inverted + ", " + e2.ignoreCase + ", " + e2.unicode + ")";
            }
            case "any":
              return "peg$anyExpectation()";
            // istanbul ignore next Because we never generate expectation type we cannot reach this branch
            default:
              throw new Error("Unknown expectation type (" + JSON.stringify(e2) + ")");
          }
        }
        function buildFunc(a, i) {
          return wrapInSourceNode(
            `
  function ${f(i)}(${a.params.join(", ")}) {`,
            reIndent(a.body, "    "),
            a.location,
            "  }"
          );
        }
        return new SourceNode(
          null,
          null,
          options2.grammarSource,
          [
            literals.map(
              (c, i) => "  const " + l(i) + " = " + buildLiteral(c) + ";"
            ).concat("", classes.map(
              (c, i) => "  const " + r(i) + " = " + buildRegexp(c) + ";"
            )).concat("", expectations.map(
              (c, i) => "  const " + e(i) + " = " + buildExpectation(c) + ";"
            )).concat("").join("\n"),
            ...functions.map(buildFunc)
          ]
        );
      }
      function generateRuleHeader(ruleNameCode, ruleIndexCode) {
        const parts = [];
        parts.push("");
        if (options2.trace) {
          parts.push(
            "peg$tracer.trace({",
            '  type: "rule.enter",',
            "  rule: " + ruleNameCode + ",",
            "  location: peg$computeLocation(startPos, startPos, true)",
            "});",
            ""
          );
        }
        if (options2.cache) {
          parts.push(
            "const key = peg$currPos * " + ast2.rules.length + " + " + ruleIndexCode + ";",
            "const cached = peg$resultsCache[key];",
            "",
            "if (cached) {",
            "  peg$currPos = cached.nextPos;",
            ""
          );
          if (options2.trace) {
            parts.push(
              "if (cached.result !== peg$FAILED) {",
              "  peg$tracer.trace({",
              '    type: "rule.match",',
              "    rule: " + ruleNameCode + ",",
              "    result: cached.result,",
              "    location: peg$computeLocation(startPos, peg$currPos, true)",
              "  });",
              "} else {",
              "  peg$tracer.trace({",
              '    type: "rule.fail",',
              "    rule: " + ruleNameCode + ",",
              "    location: peg$computeLocation(startPos, startPos, true)",
              "  });",
              "}",
              ""
            );
          }
          parts.push(
            "  return cached.result;",
            "}",
            ""
          );
        }
        return parts;
      }
      function generateRuleFooter(ruleNameCode, resultCode) {
        const parts = [];
        if (options2.cache) {
          parts.push(
            "",
            "peg$resultsCache[key] = { nextPos: peg$currPos, result: " + resultCode + " };"
          );
        }
        if (options2.trace) {
          parts.push(
            "",
            "if (" + resultCode + " !== peg$FAILED) {",
            "  peg$tracer.trace({",
            '    type: "rule.match",',
            "    rule: " + ruleNameCode + ",",
            "    result: " + resultCode + ",",
            "    location: peg$computeLocation(startPos, peg$currPos, true)",
            "  });",
            "} else {",
            "  peg$tracer.trace({",
            '    type: "rule.fail",',
            "    rule: " + ruleNameCode + ",",
            "    location: peg$computeLocation(startPos, startPos, true)",
            "  });",
            "}"
          );
        }
        parts.push(
          "",
          "return " + resultCode + ";"
        );
        return parts;
      }
      function generateRuleFunction(rule) {
        const parts = [];
        const bytecode = (
          /** @type {number[]} */
          rule.bytecode
        );
        const stack = new Stack(rule.name, "s", "let", bytecode);
        function compile(bc) {
          let ip = 0;
          const end = bc.length;
          const parts2 = [];
          let value = void 0;
          function compileCondition(cond, argCount, thenFn) {
            const baseLength = argCount + 3;
            const thenLength = bc[ip + baseLength - 2];
            const elseLength = bc[ip + baseLength - 1];
            const [thenCode, elseCode] = stack.checkedIf(
              ip,
              () => {
                ip += baseLength + thenLength;
                return (thenFn || compile)(bc.slice(ip - thenLength, ip));
              },
              elseLength > 0 ? () => {
                ip += elseLength;
                return compile(bc.slice(ip - elseLength, ip));
              } : null
            );
            parts2.push("if (" + cond + ") {");
            parts2.push(...indent2(thenCode));
            if (elseLength > 0) {
              parts2.push("} else {");
              parts2.push(...indent2(elseCode));
            }
            parts2.push("}");
          }
          function getChunkCode(inputChunkLength) {
            switch (inputChunkLength) {
              case -1:
                return "peg$getUnicode()";
              case 1:
                return "input.charAt(peg$currPos)";
              default:
                return `input.substr(peg$currPos, ${inputChunkLength})`;
            }
          }
          function getIncrCode(inputChunkLength, varName) {
            switch (inputChunkLength) {
              case -1:
                return `peg$currPos += ${varName}.length;`;
              case 1:
                return "peg$currPos++;";
              default:
                return "peg$currPos += (" + inputChunkLength + ");";
            }
          }
          function compileInputChunkCondition(condFn, argCount, inputChunkLength) {
            const baseLength = argCount + 3;
            let inputChunk = getChunkCode(inputChunkLength);
            let thenFn = null;
            if (bc[ip + baseLength] === op.ACCEPT_N && bc[ip + baseLength + 1] === inputChunkLength) {
              parts2.push(stack.push(inputChunk));
              inputChunk = stack.pop();
              thenFn = (bc2) => {
                stack.sp++;
                const code2 = compile(bc2.slice(2));
                code2.unshift(getIncrCode(inputChunkLength, inputChunk));
                return code2;
              };
            }
            compileCondition(condFn(inputChunk, thenFn !== null), argCount, thenFn);
          }
          function compileLoop(cond) {
            const baseLength = 2;
            const bodyLength = bc[ip + baseLength - 1];
            const bodyCode = stack.checkedLoop(ip, () => {
              ip += baseLength + bodyLength;
              return compile(bc.slice(ip - bodyLength, ip));
            });
            parts2.push("while (" + cond + ") {");
            parts2.push(...indent2(bodyCode));
            parts2.push("}");
          }
          function compileCall(baseLength) {
            const paramsLength = bc[ip + baseLength - 1];
            return f(bc[ip + 1]) + "(" + bc.slice(ip + baseLength, ip + baseLength + paramsLength).map(
              (p) => stack.index(p)
            ).join(", ") + ")";
          }
          while (ip < end) {
            switch (bc[ip]) {
              case op.PUSH_EMPTY_STRING:
                parts2.push(stack.push("''"));
                ip++;
                break;
              case op.PUSH_CURR_POS:
                parts2.push(stack.push("peg$currPos"));
                ip++;
                break;
              case op.PUSH_UNDEFINED:
                parts2.push(stack.push("undefined"));
                ip++;
                break;
              case op.PUSH_NULL:
                parts2.push(stack.push("null"));
                ip++;
                break;
              case op.PUSH_FAILED:
                parts2.push(stack.push("peg$FAILED"));
                ip++;
                break;
              case op.PUSH_EMPTY_ARRAY:
                parts2.push(stack.push("[]"));
                ip++;
                break;
              case op.POP:
                stack.pop();
                ip++;
                break;
              case op.POP_CURR_POS:
                parts2.push("peg$currPos = " + stack.pop() + ";");
                ip++;
                break;
              case op.POP_N:
                stack.pop(bc[ip + 1]);
                ip += 2;
                break;
              case op.NIP:
                value = stack.pop();
                stack.pop();
                parts2.push(stack.push(value));
                ip++;
                break;
              case op.APPEND:
                value = stack.pop();
                parts2.push(stack.top() + ".push(" + value + ");");
                ip++;
                break;
              case op.WRAP:
                parts2.push(
                  stack.push("[" + stack.pop(bc[ip + 1]).join(", ") + "]")
                );
                ip += 2;
                break;
              case op.TEXT:
                parts2.push(
                  stack.push("input.substring(" + stack.pop() + ", peg$currPos)")
                );
                ip++;
                break;
              case op.PLUCK: {
                const baseLength = 3;
                const paramsLength = bc[ip + baseLength - 1];
                const n = baseLength + paramsLength;
                value = bc.slice(ip + baseLength, ip + n);
                value = paramsLength === 1 ? stack.index(value[0]) : `[ ${value.map((p) => stack.index(p)).join(", ")} ]`;
                stack.pop(bc[ip + 1]);
                parts2.push(stack.push(value));
                ip += n;
                break;
              }
              case op.IF:
                compileCondition(stack.top(), 0);
                break;
              case op.IF_ERROR:
                compileCondition(stack.top() + " === peg$FAILED", 0);
                break;
              case op.IF_NOT_ERROR:
                compileCondition(stack.top() + " !== peg$FAILED", 0);
                break;
              case op.IF_LT:
                compileCondition(stack.top() + ".length < " + bc[ip + 1], 1);
                break;
              case op.IF_GE:
                compileCondition(stack.top() + ".length >= " + bc[ip + 1], 1);
                break;
              case op.IF_LT_DYNAMIC:
                compileCondition(stack.top() + ".length < (" + stack.index(bc[ip + 1]) + "|0)", 1);
                break;
              case op.IF_GE_DYNAMIC:
                compileCondition(stack.top() + ".length >= (" + stack.index(bc[ip + 1]) + "|0)", 1);
                break;
              case op.WHILE_NOT_ERROR:
                compileLoop(stack.top() + " !== peg$FAILED");
                break;
              case op.MATCH_ANY:
                compileCondition("input.length > peg$currPos", 0);
                break;
              case op.MATCH_STRING: {
                const litNum = bc[ip + 1];
                const literal = literals[litNum];
                compileInputChunkCondition(
                  (inputChunk, optimized) => {
                    if (literal.length > 1) {
                      return `${inputChunk} === ${l(litNum)}`;
                    }
                    inputChunk = !optimized ? "input.charCodeAt(peg$currPos)" : `${inputChunk}.charCodeAt(0)`;
                    return `${inputChunk} === ${literal.charCodeAt(0)}`;
                  },
                  1,
                  literal.length
                );
                break;
              }
              case op.MATCH_STRING_IC: {
                const litNum = bc[ip + 1];
                compileInputChunkCondition(
                  (inputChunk) => `${inputChunk}.toLowerCase() === ${l(litNum)}`,
                  1,
                  literals[litNum].length
                );
                break;
              }
              case op.MATCH_CHAR_CLASS: {
                const regNum = bc[ip + 1];
                compileInputChunkCondition(
                  (inputChunk) => `${r(regNum)}.test(${inputChunk})`,
                  1,
                  1
                );
                break;
              }
              case op.MATCH_UNICODE_CLASS: {
                const regNum = bc[ip + 1];
                compileInputChunkCondition(
                  (inputChunk) => `${r(regNum)}.test(${inputChunk})`,
                  1,
                  -1
                );
                break;
              }
              case op.ACCEPT_N:
                parts2.push(stack.push(getChunkCode(bc[ip + 1])));
                parts2.push(getIncrCode(bc[ip + 1], stack.top()));
                ip += 2;
                break;
              case op.ACCEPT_STRING:
                parts2.push(stack.push(l(bc[ip + 1])));
                parts2.push(
                  literals[bc[ip + 1]].length > 1 ? "peg$currPos += " + literals[bc[ip + 1]].length + ";" : "peg$currPos++;"
                );
                ip += 2;
                break;
              case op.FAIL:
                parts2.push(stack.push("peg$FAILED"));
                parts2.push("if (peg$silentFails === 0) { peg$fail(" + e(bc[ip + 1]) + "); }");
                ip += 2;
                break;
              case op.LOAD_SAVED_POS:
                parts2.push("peg$savedPos = " + stack.index(bc[ip + 1]) + ";");
                ip += 2;
                break;
              case op.UPDATE_SAVED_POS:
                parts2.push("peg$savedPos = peg$currPos;");
                ip++;
                break;
              case op.CALL:
                value = compileCall(4);
                stack.pop(bc[ip + 2]);
                parts2.push(stack.push(value));
                ip += 4 + bc[ip + 3];
                break;
              case op.RULE:
                parts2.push(stack.push(name(ast2.rules[bc[ip + 1]].name) + "()"));
                ip += 2;
                break;
              case op.LIBRARY_RULE: {
                const nm = bc[ip + 2];
                const cnm = nm === -1 ? "" : ', "' + importedNames[nm] + '"';
                parts2.push(stack.push("peg$callLibrary(" + gi(bc[ip + 1]) + cnm + ")"));
                ip += 3;
                break;
              }
              case op.SILENT_FAILS_ON:
                parts2.push("peg$silentFails++;");
                ip++;
                break;
              case op.SILENT_FAILS_OFF:
                parts2.push("peg$silentFails--;");
                ip++;
                break;
              case op.SOURCE_MAP_PUSH:
                stack.sourceMapPush(
                  parts2,
                  locations[bc[ip + 1]]
                );
                ip += 2;
                break;
              case op.SOURCE_MAP_POP: {
                stack.sourceMapPop();
                ip++;
                break;
              }
              case op.SOURCE_MAP_LABEL_PUSH:
                stack.labels[bc[ip + 1]] = {
                  label: literals[bc[ip + 2]],
                  location: locations[bc[ip + 3]]
                };
                ip += 4;
                break;
              case op.SOURCE_MAP_LABEL_POP:
                delete stack.labels[bc[ip + 1]];
                ip += 2;
                break;
              // istanbul ignore next Because we never generate invalid bytecode we cannot reach this branch
              default:
                throw new Error("Invalid opcode: " + bc[ip] + ".");
            }
          }
          return parts2;
        }
        const code = compile(bytecode);
        parts.push(wrapInSourceNode(
          "function ",
          name(rule.name),
          rule.nameLocation,
          "() {\n",
          rule.name
        ));
        if (options2.trace) {
          parts.push("  var startPos = peg$currPos;");
        }
        parts.push(indent2(stack.defines()));
        parts.push(...indent2(generateRuleHeader(
          '"' + stringEscape(rule.name) + '"',
          asts.indexOfRule(ast2, rule.name)
        )));
        parts.push(...indent2(code));
        parts.push(...indent2(generateRuleFooter(
          '"' + stringEscape(rule.name) + '"',
          stack.result()
        )));
        parts.push("}");
        parts.push("");
        return parts;
      }
      function ast2SourceNode(node) {
        if (node.codeLocation) {
          return toSourceNode(node.code, node.codeLocation, "$" + node.type);
        }
        return node.code;
      }
      function generateToplevel() {
        const parts = [];
        let topLevel = ast2.topLevelInitializer;
        if (topLevel) {
          if (Array.isArray(topLevel)) {
            if (options2.format === "es") {
              const imps = [];
              const codes = [];
              for (const tli of topLevel) {
                const [
                  imports,
                  code
                ] = (
                  /** @type {PEG.ast.TopLevelInitializer[]} */
                  parse(tli.code, {
                    startRule: "ImportsAndSource",
                    grammarSource: new GrammarLocation(
                      tli.codeLocation.source,
                      tli.codeLocation.start
                    )
                  })
                );
                if (imports.code) {
                  imps.push(imports);
                  codes.push(code);
                } else {
                  codes.push(tli);
                }
              }
              topLevel = codes.concat(imps);
            }
            const reversed = topLevel.slice(0).reverse();
            for (const tli of reversed) {
              parts.push(ast2SourceNode(tli));
              parts.push("");
            }
          } else {
            parts.push(ast2SourceNode(topLevel));
            parts.push("");
          }
        }
        parts.push(
          "class peg$SyntaxError extends SyntaxError {",
          "  constructor(message, expected, found, location) {",
          "    super(message);",
          "    this.expected = expected;",
          "    this.found = found;",
          "    this.location = location;",
          '    this.name = "SyntaxError";',
          "  }",
          "",
          "  format(sources) {",
          '    let str = "Error: " + this.message;',
          "    if (this.location) {",
          "      let src = null;",
          "      const st = sources.find(s => s.source === this.location.source);",
          "      if (st) {",
          "        src = st.text.split(/\\r\\n|\\n|\\r/g);",
          "      }",
          "      const s = this.location.start;",
          '      const offset_s = (this.location.source && (typeof this.location.source.offset === "function"))',
          "        ? this.location.source.offset(s)",
          "        : s;",
          '      const loc = this.location.source + ":" + offset_s.line + ":" + offset_s.column;',
          "      if (src) {",
          "        const e = this.location.end;",
          '        const filler = "".padEnd(offset_s.line.toString().length, " ");',
          "        const line = src[s.line - 1];",
          "        const last = s.line === e.line ? e.column : line.length + 1;",
          "        const hatLen = (last - s.column) || 1;",
          '        str += "\\n --> " + loc + "\\n"',
          '            + filler + " |\\n"',
          '            + offset_s.line + " | " + line + "\\n"',
          '            + filler + " | " + "".padEnd(s.column - 1, " ")',
          '            + "".padEnd(hatLen, "^");',
          "      } else {",
          '        str += "\\n at " + loc;',
          "      }",
          "    }",
          "    return str;",
          "  }",
          "",
          "  static buildMessage(expected, found) {",
          "    function hex(ch) {",
          "      return ch.codePointAt(0).toString(16).toUpperCase();",
          "    }",
          "",
          '    const nonPrintable = Object.prototype.hasOwnProperty.call(RegExp.prototype, "unicode")',
          '      ? new RegExp("[\\\\p{C}\\\\p{Mn}\\\\p{Mc}]", "gu")',
          "      : null;",
          "    function unicodeEscape(s) {",
          "      if (nonPrintable) {",
          '        return s.replace(nonPrintable,  ch => "\\\\u{" + hex(ch) + "}");',
          "      }",
          "      return s;",
          "    }",
          "",
          "    function literalEscape(s) {",
          "      return unicodeEscape(s",
          '        .replace(/\\\\/g, "\\\\\\\\")',
          // Backslash
          '        .replace(/"/g,  "\\\\\\"")',
          // Closing double quote
          '        .replace(/\\0/g, "\\\\0")',
          // Null
          '        .replace(/\\t/g, "\\\\t")',
          // Horizontal tab
          '        .replace(/\\n/g, "\\\\n")',
          // Line feed
          '        .replace(/\\r/g, "\\\\r")',
          // Carriage return
          '        .replace(/[\\x00-\\x0F]/g,          ch => "\\\\x0" + hex(ch))',
          '        .replace(/[\\x10-\\x1F\\x7F-\\x9F]/g, ch => "\\\\x"  + hex(ch)));',
          "    }",
          "",
          "    function classEscape(s) {",
          "      return unicodeEscape(s",
          '        .replace(/\\\\/g, "\\\\\\\\")',
          // Backslash
          '        .replace(/\\]/g, "\\\\]")',
          // Closing bracket
          '        .replace(/\\^/g, "\\\\^")',
          // Caret
          '        .replace(/-/g,  "\\\\-")',
          // Dash
          '        .replace(/\\0/g, "\\\\0")',
          // Null
          '        .replace(/\\t/g, "\\\\t")',
          // Horizontal tab
          '        .replace(/\\n/g, "\\\\n")',
          // Line feed
          '        .replace(/\\r/g, "\\\\r")',
          // Carriage return
          '        .replace(/[\\x00-\\x0F]/g,          ch => "\\\\x0" + hex(ch))',
          '        .replace(/[\\x10-\\x1F\\x7F-\\x9F]/g, ch => "\\\\x"  + hex(ch)));',
          "    }",
          "",
          "    const DESCRIBE_EXPECTATION_FNS = {",
          "      literal(expectation) {",
          '        return "\\"" + literalEscape(expectation.text) + "\\"";',
          "      },",
          "",
          "      class(expectation) {",
          "        const escapedParts = expectation.parts.map(",
          "          part => (Array.isArray(part)",
          '            ? classEscape(part[0]) + "-" + classEscape(part[1])',
          "            : classEscape(part))",
          "        );",
          "",
          '        return "[" + (expectation.inverted ? "^" : "") + escapedParts.join("") + "]" + (expectation.unicode ? "u" : "");',
          "      },",
          "",
          "      any() {",
          '        return "any character";',
          "      },",
          "",
          "      end() {",
          '        return "end of input";',
          "      },",
          "",
          "      other(expectation) {",
          "        return expectation.description;",
          "      },",
          "    };",
          "",
          "    function describeExpectation(expectation) {",
          "      return DESCRIBE_EXPECTATION_FNS[expectation.type](expectation);",
          "    }",
          "",
          "    function describeExpected(expected) {",
          "      const descriptions = expected.map(describeExpectation);",
          "      descriptions.sort();",
          "",
          "      if (descriptions.length > 0) {",
          "        let j = 1;",
          "        for (let i = 1; i < descriptions.length; i++) {",
          "          if (descriptions[i - 1] !== descriptions[i]) {",
          "            descriptions[j] = descriptions[i];",
          "            j++;",
          "          }",
          "        }",
          "        descriptions.length = j;",
          "      }",
          "",
          "      switch (descriptions.length) {",
          "        case 1:",
          "          return descriptions[0];",
          "",
          "        case 2:",
          '          return descriptions[0] + " or " + descriptions[1];',
          "",
          "        default:",
          '          return descriptions.slice(0, -1).join(", ")',
          '            + ", or "',
          "            + descriptions[descriptions.length - 1];",
          "      }",
          "    }",
          "",
          "    function describeFound(found) {",
          '      return found ? "\\"" + literalEscape(found) + "\\"" : "end of input";',
          "    }",
          "",
          '    return "Expected " + describeExpected(expected) + " but " + describeFound(found) + " found.";',
          "  }",
          "}",
          ""
        );
        if (options2.trace) {
          parts.push(
            "class peg$DefaultTracer {",
            "  constructor() {",
            "    this.indentLevel = 0;",
            "  }",
            "",
            "  trace(event) {",
            "    const that = this;",
            "",
            "    function log(event) {",
            "      console?.log?.(",
            '        event.location.start.line + ":" + event.location.start.column + "-"',
            '          + event.location.end.line + ":" + event.location.end.column + " "',
            '          + event.type.padEnd(10, " ")',
            '          + "".padEnd((that.indentLevel * 2) + 1, " ") + event.rule',
            "       );",
            "    }",
            "",
            "    switch (event.type) {",
            '      case "rule.enter":',
            "        log(event);",
            "        this.indentLevel++;",
            "        break;",
            "",
            '      case "rule.match":',
            "        this.indentLevel--;",
            "        log(event);",
            "        break;",
            "",
            '      case "rule.fail":',
            "        this.indentLevel--;",
            "        log(event);",
            "        break;",
            "",
            "      default:",
            '        throw new Error("Invalid event type: " + event.type + ".");',
            "    }",
            "  }",
            "}",
            ""
          );
        }
        const startRuleFunctions = "{\n" + allowedStartRules.map((r2) => `    ${r2}: ${name(r2)},
`).join("") + "  }";
        const startRuleFunction = name(allowedStartRules[0]);
        parts.push(
          "function peg$parse(input, options) {",
          "  options = options !== undefined ? options : {};",
          "",
          "  const peg$FAILED = {};",
          "  const peg$source = options.grammarSource;",
          "",
          "  const peg$startRuleFunctions = " + startRuleFunctions + ";",
          "  let peg$startRuleFunction = " + startRuleFunction + ";",
          "",
          generateTables(),
          "",
          "  let peg$currPos = options.peg$currPos | 0;",
          "  let peg$savedPos = peg$currPos;",
          "  const peg$posDetailsCache = [{ line: 1, column: 1 }];",
          "  let peg$maxFailPos = peg$currPos;",
          "  let peg$maxFailExpected = options.peg$maxFailExpected || [];",
          "  let peg$silentFails = options.peg$silentFails | 0;",
          // 0 = report failures, > 0 = silence failures
          ""
        );
        if (options2.cache) {
          parts.push(
            "  let peg$resultsCache = {};",
            ""
          );
        }
        if (options2.trace) {
          parts.push(
            '  let peg$tracer = "tracer" in options ? options.tracer : new peg$DefaultTracer();',
            ""
          );
        }
        parts.push(
          "  let peg$result;",
          "",
          "  if (options.startRule) {",
          "    if (!(options.startRule in peg$startRuleFunctions)) {",
          `      throw new Error("Can't start parsing from rule \\"" + options.startRule + "\\".");`,
          "    }",
          "",
          "    peg$startRuleFunction = peg$startRuleFunctions[options.startRule];",
          "  }",
          "",
          "  function text() {",
          "    return input.substring(peg$savedPos, peg$currPos);",
          "  }",
          "",
          "  function offset() {",
          "    return peg$savedPos;",
          "  }",
          "",
          "  function range() {",
          "    return {",
          "      source: peg$source,",
          "      start: peg$savedPos,",
          "      end: peg$currPos,",
          "    };",
          "  }",
          "",
          "  function location() {",
          "    return peg$computeLocation(peg$savedPos, peg$currPos);",
          "  }",
          "",
          "  function expected(description, location) {",
          "    location = location !== undefined",
          "      ? location",
          "      : peg$computeLocation(peg$savedPos, peg$currPos);",
          "",
          "    throw peg$buildStructuredError(",
          "      [peg$otherExpectation(description)],",
          "      input.substring(peg$savedPos, peg$currPos),",
          "      location",
          "    );",
          "  }",
          "",
          "  function error(message, location) {",
          "    location = location !== undefined",
          "      ? location",
          "      : peg$computeLocation(peg$savedPos, peg$currPos);",
          "",
          "    throw peg$buildSimpleError(message, location);",
          "  }",
          "",
          "  function peg$getUnicode(pos = peg$currPos) {",
          "    const cp = input.codePointAt(pos);",
          "    if (cp === undefined) {",
          '      return "";',
          "    }",
          "    return String.fromCodePoint(cp);",
          "  }",
          "",
          "  function peg$literalExpectation(text, ignoreCase) {",
          '    return { type: "literal", text, ignoreCase };',
          "  }",
          "",
          "  function peg$classExpectation(parts, inverted, ignoreCase, unicode) {",
          '    return { type: "class", parts, inverted, ignoreCase, unicode };',
          "  }",
          "",
          "  function peg$anyExpectation() {",
          '    return { type: "any" };',
          "  }",
          "",
          "  function peg$endExpectation() {",
          '    return { type: "end" };',
          "  }",
          "",
          "  function peg$otherExpectation(description) {",
          '    return { type: "other", description };',
          "  }",
          "",
          "  function peg$computePosDetails(pos) {",
          "    let details = peg$posDetailsCache[pos];",
          "    let p;",
          "",
          "    if (details) {",
          "      return details;",
          "    } else {",
          "      if (pos >= peg$posDetailsCache.length) {",
          "        p = peg$posDetailsCache.length - 1;",
          "      } else {",
          "        p = pos;",
          "        while (!peg$posDetailsCache[--p]) {}",
          "      }",
          "",
          "      details = peg$posDetailsCache[p];",
          "      details = {",
          "        line: details.line,",
          "        column: details.column,",
          "      };",
          "",
          "      while (p < pos) {",
          "        if (input.charCodeAt(p) === 10) {",
          "          details.line++;",
          "          details.column = 1;",
          "        } else {",
          "          details.column++;",
          "        }",
          "",
          "        p++;",
          "      }",
          "",
          "      peg$posDetailsCache[pos] = details;",
          "",
          "      return details;",
          "    }",
          "  }",
          "",
          "  function peg$computeLocation(startPos, endPos, offset) {",
          "    const startPosDetails = peg$computePosDetails(startPos);",
          "    const endPosDetails = peg$computePosDetails(endPos);",
          "",
          "    const res = {",
          "      source: peg$source,",
          "      start: {",
          "        offset: startPos,",
          "        line: startPosDetails.line,",
          "        column: startPosDetails.column,",
          "      },",
          "      end: {",
          "        offset: endPos,",
          "        line: endPosDetails.line,",
          "        column: endPosDetails.column,",
          "      },",
          "    };",
          '    if (offset && peg$source && (typeof peg$source.offset === "function")) {',
          "      res.start = peg$source.offset(res.start);",
          "      res.end = peg$source.offset(res.end);",
          "    }",
          "    return res;",
          "  }",
          "",
          "  function peg$fail(expected) {",
          "    if (peg$currPos < peg$maxFailPos) { return; }",
          "",
          "    if (peg$currPos > peg$maxFailPos) {",
          "      peg$maxFailPos = peg$currPos;",
          "      peg$maxFailExpected = [];",
          "    }",
          "",
          "    peg$maxFailExpected.push(expected);",
          "  }",
          "",
          "  function peg$buildSimpleError(message, location) {",
          "    return new peg$SyntaxError(message, null, null, location);",
          "  }",
          "",
          "  function peg$buildStructuredError(expected, found, location) {",
          "    return new peg$SyntaxError(",
          "      peg$SyntaxError.buildMessage(expected, found),",
          "      expected,",
          "      found,",
          "      location",
          "    );",
          "  }",
          ""
        );
        if (ast2.imports.length > 0) {
          parts.push(
            "  function peg$callLibrary(lib, startRule) {",
            "    const opts = Object.assign({}, options, {",
            "      startRule: startRule,",
            "      peg$currPos: peg$currPos,",
            "      peg$silentFails: peg$silentFails,",
            "      peg$library: true,",
            "      peg$maxFailExpected: peg$maxFailExpected",
            "    });",
            "    const res = lib.parse(input, opts);",
            "    peg$currPos = res.peg$currPos;",
            "    peg$maxFailPos = res.peg$maxFailPos;",
            "    peg$maxFailExpected = res.peg$maxFailExpected;",
            "    return (res.peg$result === res.peg$FAILED) ? peg$FAILED : res.peg$result;",
            "  }",
            ""
          );
        }
        ast2.rules.forEach((rule) => {
          parts.push(...indent2(generateRuleFunction(rule)));
        });
        if (ast2.initializer) {
          if (Array.isArray(ast2.initializer)) {
            for (const init of ast2.initializer) {
              parts.push(ast2SourceNode(init));
              parts.push("");
            }
          } else {
            parts.push(ast2SourceNode(ast2.initializer));
            parts.push("");
          }
        }
        parts.push(
          "  peg$result = peg$startRuleFunction();",
          "",
          "  const peg$success = (peg$result !== peg$FAILED && peg$currPos === input.length);",
          "  function peg$throw() {",
          "    if (peg$result !== peg$FAILED && peg$currPos < input.length) {",
          "      peg$fail(peg$endExpectation());",
          "    }",
          "",
          "    throw peg$buildStructuredError(",
          "      peg$maxFailExpected,",
          "      peg$maxFailPos < input.length ? peg$getUnicode(peg$maxFailPos) : null,",
          "      peg$maxFailPos < input.length",
          "        ? peg$computeLocation(peg$maxFailPos, peg$maxFailPos + 1)",
          "        : peg$computeLocation(peg$maxFailPos, peg$maxFailPos)",
          "    );",
          "  }",
          "  if (options.peg$library) {",
          // Hide this from TypeScript.  It's internal-only until library mode is stabilized.
          "    return /** @type {any} */ ({",
          "      peg$result,",
          "      peg$currPos,",
          "      peg$FAILED,",
          "      peg$maxFailExpected,",
          "      peg$maxFailPos,",
          "      peg$success,",
          "      peg$throw: peg$success ? undefined : peg$throw,",
          "    });",
          "  }",
          "  if (peg$success) {",
          "    return peg$result;",
          "  } else {",
          "    peg$throw();",
          "  }",
          "}"
        );
        return new SourceNode(
          // This expression has a better readability when on two lines
          // eslint-disable-next-line @stylistic/function-call-argument-newline
          null,
          null,
          options2.grammarSource,
          parts.map((s) => s instanceof SourceNode ? s : s + "\n")
        );
      }
      function generateWrapper(toplevelCode) {
        function generateGeneratedByComment() {
          return [
            `// @generated by Peggy ${version}.`,
            "//",
            "// https://peggyjs.org/"
          ];
        }
        function generateParserObject() {
          const res = ["{"];
          if (options2.trace) {
            res.push("  DefaultTracer: peg$DefaultTracer,");
          }
          if (options2.allowedStartRules) {
            res.push("  StartRules: [" + options2.allowedStartRules.map((r2) => '"' + r2 + '"').join(", ") + "],");
          }
          res.push(
            "  SyntaxError: peg$SyntaxError,",
            "  parse: peg$parse,"
          );
          res.push("}");
          return res.join("\n");
        }
        const generators = {
          bare() {
            if (Object.keys(dependencies).length > 0 || ast2.imports.length > 0) {
              throw new Error("Dependencies not supported in format 'bare'.");
            }
            return [
              ...generateGeneratedByComment(),
              "(function() {",
              '  "use strict";',
              toplevelCode,
              indent2("return " + generateParserObject() + ";"),
              "})()"
            ];
          },
          commonjs() {
            const dependencyVars = Object.keys(dependencies);
            const parts2 = generateGeneratedByComment();
            parts2.push(
              "",
              '"use strict";'
            );
            if (dependencyVars.length > 0) {
              dependencyVars.forEach((variable) => {
                parts2.push(
                  "const " + variable + ' = require("' + stringEscape(dependencies[variable]) + '");'
                );
              });
              parts2.push("");
            }
            const impLen = ast2.imports.length;
            for (let i = 0; i < impLen; i++) {
              parts2.push(
                "const " + gi(i) + ' = require("' + stringEscape(ast2.imports[i].from.module) + '");'
              );
            }
            parts2.push(
              "",
              toplevelCode,
              "",
              "module.exports = " + generateParserObject() + ";"
            );
            return parts2;
          },
          es() {
            const dependencyVars = Object.keys(dependencies);
            const parts2 = generateGeneratedByComment();
            parts2.push("");
            if (dependencyVars.length > 0) {
              dependencyVars.forEach((variable) => {
                parts2.push(
                  "import " + variable + ' from "' + stringEscape(dependencies[variable]) + '";'
                );
              });
              parts2.push("");
            }
            for (let i = 0; i < ast2.imports.length; i++) {
              parts2.push(
                "import * as " + gi(i) + ' from "' + stringEscape(ast2.imports[i].from.module) + '";'
              );
            }
            parts2.push(
              "",
              toplevelCode,
              ""
            );
            parts2.push(
              "const peg$allowedStartRules = [",
              "  " + (options2.allowedStartRules ? options2.allowedStartRules.map((r2) => '"' + r2 + '"').join(",\n  ") : ""),
              "];",
              ""
            );
            parts2.push(
              "export {"
            );
            if (options2.trace) {
              parts2.push("  peg$DefaultTracer as DefaultTracer,");
            }
            parts2.push(
              "  peg$allowedStartRules as StartRules,",
              "  peg$SyntaxError as SyntaxError,",
              "  peg$parse as parse",
              "};"
            );
            return parts2;
          },
          amd() {
            if (ast2.imports.length > 0) {
              throw new Error("Imports are not supported in format 'amd'.");
            }
            const dependencyVars = Object.keys(dependencies);
            const dependencyIds = dependencyVars.map((v) => dependencies[v]);
            const deps = "[" + dependencyIds.map(
              (id) => '"' + stringEscape(id) + '"'
            ).join(", ") + "]";
            const params = dependencyVars.join(", ");
            return [
              ...generateGeneratedByComment(),
              "define(" + deps + ", function(" + params + ") {",
              '  "use strict";',
              toplevelCode,
              "",
              indent2("return " + generateParserObject() + ";"),
              "});"
            ];
          },
          globals() {
            if (Object.keys(dependencies).length > 0 || ast2.imports.length > 0) {
              throw new Error("Dependencies not supported in format 'globals'.");
            }
            if (!options2.exportVar) {
              throw new Error("No export variable defined for format 'globals'.");
            }
            return [
              ...generateGeneratedByComment(),
              "(function(root) {",
              '  "use strict";',
              toplevelCode,
              "",
              indent2("root." + options2.exportVar + " = " + generateParserObject() + ";"),
              "})(this);"
            ];
          },
          umd() {
            if (ast2.imports.length > 0) {
              throw new Error("Imports are not supported in format 'umd'.");
            }
            const dependencyVars = Object.keys(dependencies);
            const dependencyIds = dependencyVars.map((v) => dependencies[v]);
            const deps = "[" + dependencyIds.map(
              (id) => '"' + stringEscape(id) + '"'
            ).join(", ") + "]";
            const requires = dependencyIds.map(
              (id) => 'require("' + stringEscape(id) + '")'
            ).join(", ");
            const params = dependencyVars.join(", ");
            const parts2 = generateGeneratedByComment();
            parts2.push(
              "(function(root, factory) {",
              '  if (typeof define === "function" && define.amd) {',
              "    define(" + deps + ", factory);",
              '  } else if (typeof module === "object" && module.exports) {',
              "    module.exports = factory(" + requires + ");"
            );
            if (options2.exportVar) {
              parts2.push(
                "  } else {",
                "    root." + options2.exportVar + " = factory();"
              );
            }
            parts2.push(
              "  }",
              "})(this, function(" + params + ") {",
              '  "use strict";',
              toplevelCode,
              "",
              indent2("return " + generateParserObject() + ";"),
              "});"
            );
            return parts2;
          }
        };
        const parts = generators[options2.format || "bare"]();
        return new SourceNode(
          // eslint-disable-next-line @stylistic/function-call-argument-newline -- This expression has a better readability when on two lines
          null,
          null,
          options2.grammarSource,
          parts.map((s) => s instanceof SourceNode ? s : s + "\n")
        );
      }
      ast2.code = generateWrapper(generateToplevel());
    }
    module2.exports = generateJS2;
  }
});

// ../../node_modules/peggy/lib/compiler/passes/remove-proxy-rules.js
var require_remove_proxy_rules = __commonJS({
  "../../node_modules/peggy/lib/compiler/passes/remove-proxy-rules.js"(exports2, module2) {
    "use strict";
    var asts = require_asts();
    var visitor2 = require_visitor();
    function removeProxyRules2(ast2, _options, session2) {
      function isProxyRule(node) {
        return node.type === "rule" && node.expression.type === "rule_ref";
      }
      function replaceRuleRefs(ast3, from, to) {
        const replace = visitor2.build({
          rule_ref(node) {
            if (node.name === from) {
              node.name = to;
              session2.info(
                `Proxy rule "${from}" replaced by the rule "${to}"`,
                node.location,
                [{
                  message: "This rule will be used",
                  location: asts.findRule(ast3, to).nameLocation
                }]
              );
            }
          }
        });
        replace(ast3);
      }
      ast2.rules.forEach((rule) => {
        if (isProxyRule(rule)) {
          replaceRuleRefs(ast2, rule.name, rule.expression.name);
        }
      });
    }
    module2.exports = removeProxyRules2;
  }
});

// ../../node_modules/peggy/lib/compiler/passes/merge-character-classes.js
var require_merge_character_classes = __commonJS({
  "../../node_modules/peggy/lib/compiler/passes/merge-character-classes.js"(exports2, module2) {
    "use strict";
    var { stringEscape } = require_utils();
    var visitor2 = require_visitor();
    var { codePointLen1 } = require_utils();
    function cloneOver(target, source) {
      const t = (
        /** @type {Record<string,unknown>} */
        target
      );
      const s = (
        /** @type {Record<string,unknown>} */
        source
      );
      Object.keys(t).forEach((key) => delete t[key]);
      Object.keys(s).forEach((key) => {
        t[key] = s[key];
      });
    }
    function cleanParts(parts) {
      parts.sort((a, b) => {
        const [aStart, aEnd] = Array.isArray(a) ? a : [a, a];
        const [bStart, bEnd] = Array.isArray(b) ? b : [b, b];
        if (aStart !== bStart) {
          return aStart < bStart ? -1 : 1;
        }
        if (aEnd !== bEnd) {
          return aEnd > bEnd ? -1 : 1;
        }
        return 0;
      });
      let prevStart = "";
      let prevEnd = "";
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const [curStart, curEnd] = Array.isArray(part) ? part : [part, part];
        if (typeof curStart === "string" && typeof curEnd === "string" && typeof prevStart === "string" && typeof prevEnd === "string") {
          if (curEnd <= prevEnd) {
            parts.splice(i--, 1);
            continue;
          }
          if (prevEnd.charCodeAt(0) + 1 >= curStart.charCodeAt(0)) {
            parts.splice(i--, 1);
            parts[i] = [prevStart, prevEnd = curEnd];
            continue;
          }
        }
        prevStart = curStart;
        prevEnd = curEnd;
      }
      return parts;
    }
    var LAST_LOW = String.fromCodePoint(55295);
    var FIRST_SURROGATE = 55296;
    var LAST_SURROGATE = 57343;
    var FIRST_HIGH = String.fromCodePoint(57344);
    function splitUnicodeRanges(ast2, session2) {
      const split = visitor2.build({
        /**
         * @param {PEG.ast.CharacterClass} node
         */
        class(node) {
          if (!node.unicode) {
            return;
          }
          const extras = [];
          for (const p of node.parts) {
            if (Array.isArray(p)) {
              const [s, e] = p.map((c) => (
                /** @type {number} */
                c.codePointAt(0)
              ));
              if (s < FIRST_SURROGATE && e > LAST_SURROGATE) {
                session2.info(
                  `Removing surrogate range from [${stringEscape(p[0])}-${stringEscape(p[1])}]`,
                  node.location
                );
                extras.push([FIRST_HIGH, p[1]]);
                p[1] = LAST_LOW;
              }
            }
          }
          node.parts.push(...extras);
        }
      });
      split(ast2);
    }
    function mergeCharacterClasses2(ast2, _options, session2) {
      const rules = /* @__PURE__ */ Object.create(null);
      ast2.rules.forEach((rule) => rules[rule.name] = rule.expression);
      const processedRules = /* @__PURE__ */ new Set();
      splitUnicodeRanges(ast2, session2);
      const [asClass, merge2] = [
        /**
         * Determine whether a node can be represented as a simple character class,
         * and return that class if so.
         *
         * @param {PEG.ast.Expression} node - the node to inspect
         * @param {boolean} [clone=false] - if true, always return a new node that
         *   can be modified by the caller
         * @returns {PEG.ast.CharacterClass | null}
         */
        (node, clone = false) => {
          switch (node.type) {
            case "class":
              if (node.inverted) {
                break;
              }
              return clone ? { ...node, parts: [...node.parts] } : node;
            case "literal": {
              const ul = codePointLen1(node.value);
              if (ul < 0) {
                break;
              }
              return {
                type: "class",
                parts: [node.value],
                inverted: false,
                ignoreCase: node.ignoreCase,
                location: node.location,
                unicode: ul > 65535
              };
            }
            case "rule_ref": {
              const ref = rules[node.name];
              if (!ref) {
                break;
              }
              if (!processedRules.has(node.name)) {
                processedRules.add(node.name);
                merge2(ref);
              }
              const cls = asClass(ref, true);
              if (cls) {
                cls.location = node.location;
              }
              return cls;
            }
          }
          return null;
        },
        visitor2.build({
          // "merge"
          choice(node) {
            let prev = null;
            let changed = false;
            node.alternatives.forEach((alt, i) => {
              merge2(alt);
              const cls = asClass(alt);
              if (!cls) {
                prev = null;
                return;
              }
              if (prev && prev.ignoreCase === cls.ignoreCase) {
                prev.parts.push(...cls.parts);
                node.alternatives[i - 1] = prev;
                node.alternatives[i] = prev;
                prev.unicode = prev.unicode || cls.unicode;
                prev.location = {
                  // Fix this when imports work.  Needs a combined source class.
                  source: prev.location.source,
                  start: prev.location.start,
                  end: cls.location.end
                };
                changed = true;
              } else {
                prev = cls;
              }
            });
            if (changed) {
              node.alternatives = node.alternatives.filter(
                (alt, i, arr) => !i || alt !== arr[i - 1]
              );
              node.alternatives.forEach((alt, i) => {
                if (alt.type === "class") {
                  alt.parts = cleanParts(alt.parts);
                  if (alt.parts.length === 1 && !Array.isArray(alt.parts[0]) && typeof alt.parts[0] === "string" && !alt.inverted) {
                    node.alternatives[i] = {
                      type: "literal",
                      value: alt.parts[0],
                      ignoreCase: alt.ignoreCase,
                      location: alt.location
                    };
                  }
                }
              });
              if (node.alternatives.length === 1) {
                cloneOver(node, node.alternatives[0]);
              }
            }
          },
          text(node) {
            merge2(node.expression);
            if (node.expression.type === "class" || node.expression.type === "literal") {
              const location = node.location;
              cloneOver(node, node.expression);
              node.location = location;
            }
          }
        })
      ];
      ast2.rules.forEach((rule) => {
        processedRules.add(rule.name);
        merge2(rule.expression);
      });
    }
    module2.exports = mergeCharacterClasses2;
  }
});

// ../../node_modules/peggy/lib/compiler/passes/remove-unused-rules.js
var require_remove_unused_rules = __commonJS({
  "../../node_modules/peggy/lib/compiler/passes/remove-unused-rules.js"(exports2, module2) {
    "use strict";
    var visitor2 = require_visitor();
    function removeUnusedRules2(ast2, options2, session2) {
      const rules = /* @__PURE__ */ Object.create(null);
      ast2.rules.forEach((rule) => {
        rules[rule.name] = rule;
      });
      const queue = [...options2.allowedStartRules];
      const found = /* @__PURE__ */ new Set();
      const findRefs = visitor2.build({
        rule_ref(node) {
          queue.push(node.name);
        }
      });
      while (queue.length) {
        const r = queue.shift();
        if (!found.has(r)) {
          found.add(r);
          findRefs(rules[r]);
        }
      }
      ast2.rules = ast2.rules.filter((r) => {
        if (found.has(r.name)) {
          return true;
        }
        session2.info(`Removing unused rule: "${r.name}"`, r.location);
        return false;
      });
    }
    module2.exports = removeUnusedRules2;
  }
});

// ../../node_modules/peggy/lib/compiler/passes/report-duplicate-imports.js
var require_report_duplicate_imports = __commonJS({
  "../../node_modules/peggy/lib/compiler/passes/report-duplicate-imports.js"(exports2, module2) {
    "use strict";
    function reportDuplicateImports2(ast2, _options, session2) {
      const all = {};
      for (const imp of ast2.imports) {
        for (const what of imp.what) {
          if (what.type === "import_binding_all") {
            if (Object.prototype.hasOwnProperty.call(all, what.binding)) {
              session2.error(
                `Module "${what.binding}" is already imported`,
                what.location,
                [{
                  message: "Original module location",
                  location: all[what.binding]
                }]
              );
            }
            all[what.binding] = what.location;
          }
        }
      }
    }
    module2.exports = reportDuplicateImports2;
  }
});

// ../../node_modules/peggy/lib/compiler/passes/report-duplicate-labels.js
var require_report_duplicate_labels = __commonJS({
  "../../node_modules/peggy/lib/compiler/passes/report-duplicate-labels.js"(exports2, module2) {
    "use strict";
    var visitor2 = require_visitor();
    function reportDuplicateLabels2(ast2, _options, session2) {
      function cloneEnv(env) {
        const clone = {};
        Object.keys(env).forEach((name) => {
          clone[name] = env[name];
        });
        return clone;
      }
      function checkExpressionWithClonedEnv(node, env) {
        check(node.expression, cloneEnv(env));
      }
      const check = visitor2.build({
        rule(node) {
          check(node.expression, {});
        },
        choice(node, env) {
          node.alternatives.forEach((alternative) => {
            check(alternative, cloneEnv(env));
          });
        },
        action: checkExpressionWithClonedEnv,
        labeled(node, env) {
          const label = node.label;
          if (label && Object.prototype.hasOwnProperty.call(env, label)) {
            session2.error(
              `Label "${node.label}" is already defined`,
              node.labelLocation,
              [{
                message: "Original label location",
                location: env[label]
              }]
            );
          }
          check(node.expression, env);
          env[node.label] = node.labelLocation;
        },
        text: checkExpressionWithClonedEnv,
        simple_and: checkExpressionWithClonedEnv,
        simple_not: checkExpressionWithClonedEnv,
        optional: checkExpressionWithClonedEnv,
        zero_or_more: checkExpressionWithClonedEnv,
        one_or_more: checkExpressionWithClonedEnv,
        repeated(node, env) {
          if (node.delimiter) {
            check(node.delimiter, cloneEnv(env));
          }
          check(node.expression, cloneEnv(env));
        },
        group: checkExpressionWithClonedEnv
      });
      check(ast2);
    }
    module2.exports = reportDuplicateLabels2;
  }
});

// ../../node_modules/peggy/lib/compiler/passes/report-duplicate-rules.js
var require_report_duplicate_rules = __commonJS({
  "../../node_modules/peggy/lib/compiler/passes/report-duplicate-rules.js"(exports2, module2) {
    "use strict";
    var visitor2 = require_visitor();
    function reportDuplicateRules2(ast2, _options, session2) {
      const rules = {};
      const check = visitor2.build({
        rule(node) {
          if (Object.prototype.hasOwnProperty.call(rules, node.name)) {
            session2.error(
              `Rule "${node.name}" is already defined`,
              node.nameLocation,
              [{
                message: "Original rule location",
                location: rules[node.name]
              }]
            );
            return;
          }
          rules[node.name] = node.nameLocation;
        }
      });
      check(ast2);
    }
    module2.exports = reportDuplicateRules2;
  }
});

// ../../node_modules/peggy/lib/compiler/passes/report-infinite-recursion.js
var require_report_infinite_recursion = __commonJS({
  "../../node_modules/peggy/lib/compiler/passes/report-infinite-recursion.js"(exports2, module2) {
    "use strict";
    var asts = require_asts();
    var visitor2 = require_visitor();
    function reportInfiniteRecursion2(ast2, _options, session2) {
      const visitedRules = [];
      const backtraceRefs = [];
      const seen = /* @__PURE__ */ new Set();
      const check = visitor2.build({
        rule(node) {
          if (session2.errors > 0 || seen.has(node.name)) {
            return;
          }
          seen.add(node.name);
          visitedRules.push(node.name);
          check(node.expression);
          visitedRules.pop();
        },
        sequence(node) {
          if (session2.errors > 0) {
            return;
          }
          node.elements.every((element) => {
            check(element);
            if (session2.errors > 0) {
              return false;
            }
            return !asts.alwaysConsumesOnSuccess(ast2, element);
          });
        },
        repeated(node) {
          if (session2.errors > 0) {
            return;
          }
          check(node.expression);
          if (node.delimiter && !asts.alwaysConsumesOnSuccess(ast2, node.expression)) {
            check(node.delimiter);
          }
        },
        rule_ref(node) {
          if (session2.errors > 0) {
            return;
          }
          backtraceRefs.push(node);
          const rule = asts.findRule(ast2, node.name);
          if (visitedRules.indexOf(node.name) !== -1) {
            visitedRules.push(node.name);
            session2.error(
              "Possible infinite loop when parsing (left recursion: " + visitedRules.join(" -> ") + ")",
              rule.nameLocation,
              backtraceRefs.map((ref, i, a) => ({
                message: i + 1 !== a.length ? `Step ${i + 1}: call of the rule "${ref.name}" without input consumption` : `Step ${i + 1}: calls itself without input consumption - left recursion`,
                location: ref.location
              }))
            );
            return;
          }
          if (rule) {
            check(rule);
          }
          backtraceRefs.pop();
        }
      });
      check(ast2);
    }
    module2.exports = reportInfiniteRecursion2;
  }
});

// ../../node_modules/peggy/lib/compiler/passes/report-infinite-repetition.js
var require_report_infinite_repetition = __commonJS({
  "../../node_modules/peggy/lib/compiler/passes/report-infinite-repetition.js"(exports2, module2) {
    "use strict";
    var asts = require_asts();
    var visitor2 = require_visitor();
    function reportInfiniteRepetition2(ast2, _options, session2) {
      const check = visitor2.build({
        zero_or_more(node) {
          if (!asts.alwaysConsumesOnSuccess(ast2, node.expression)) {
            session2.error(
              "Possible infinite loop when parsing (repetition used with an expression that may not consume any input)",
              node.location
            );
          }
        },
        one_or_more(node) {
          if (!asts.alwaysConsumesOnSuccess(ast2, node.expression)) {
            session2.error(
              "Possible infinite loop when parsing (repetition used with an expression that may not consume any input)",
              node.location
            );
          }
        },
        repeated(node) {
          if (node.delimiter) {
            check(node.delimiter);
          }
          if (asts.alwaysConsumesOnSuccess(ast2, node.expression) || node.delimiter && asts.alwaysConsumesOnSuccess(ast2, node.delimiter)) {
            return;
          }
          if (node.max.value === null) {
            session2.error(
              "Possible infinite loop when parsing (unbounded range repetition used with an expression that may not consume any input)",
              node.location
            );
          } else {
            const min = node.min ? node.min : node.max;
            session2.warning(
              min.type === "constant" && node.max.type === "constant" ? `An expression may not consume any input and may always match ${node.max.value} times` : "An expression may not consume any input and may always match with a maximum repetition count",
              node.location
            );
          }
        }
      });
      check(ast2);
    }
    module2.exports = reportInfiniteRepetition2;
  }
});

// ../../node_modules/peggy/lib/compiler/passes/report-undefined-rules.js
var require_report_undefined_rules = __commonJS({
  "../../node_modules/peggy/lib/compiler/passes/report-undefined-rules.js"(exports2, module2) {
    "use strict";
    var asts = require_asts();
    var visitor2 = require_visitor();
    function reportUndefinedRules2(ast2, _options, session2) {
      const check = visitor2.build({
        rule_ref(node) {
          if (!asts.findRule(ast2, node.name)) {
            session2.error(
              `Rule "${node.name}" is not defined`,
              node.location
            );
          }
        }
      });
      check(ast2);
    }
    module2.exports = reportUndefinedRules2;
  }
});

// ../../node_modules/peggy/lib/compiler/passes/report-incorrect-plucking.js
var require_report_incorrect_plucking = __commonJS({
  "../../node_modules/peggy/lib/compiler/passes/report-incorrect-plucking.js"(exports2, module2) {
    "use strict";
    var visitor2 = require_visitor();
    function reportIncorrectPlucking2(ast2, _options, session2) {
      const check = visitor2.build({
        action(node) {
          check(node.expression, node);
        },
        labeled(node, action) {
          if (node.pick) {
            if (action) {
              session2.error(
                '"@" cannot be used with an action block',
                node.labelLocation,
                [{
                  message: "Action block location",
                  location: action.codeLocation
                }]
              );
            }
          }
          check(node.expression);
        }
      });
      check(ast2);
    }
    module2.exports = reportIncorrectPlucking2;
  }
});

// ../../node_modules/peggy/lib/compiler/passes/report-unreachable.js
var require_report_unreachable = __commonJS({
  "../../node_modules/peggy/lib/compiler/passes/report-unreachable.js"(exports2, module2) {
    "use strict";
    var visitor2 = require_visitor();
    var { ALWAYS_MATCH, NEVER_MATCH } = require_inference_match_result();
    function reportUnreachable2(ast2, _options, session2) {
      const visit = visitor2.build({
        /**
         * @param {PEG.ast.Choice} node
         */
        choice(node) {
          node.alternatives.forEach((a) => visit(a));
          for (let i = 0; i < node.alternatives.length - 1; i++) {
            const alt = node.alternatives[i];
            if (alt.match === ALWAYS_MATCH) {
              session2.warning(
                "Always matches.  Following alternatives may not be reachable.",
                alt.location
              );
            }
          }
        },
        /**
         * @param {PEG.ast.Prefixed} node
         */
        simple_and(node) {
          visit(node.expression);
          if (node.expression.match === ALWAYS_MATCH) {
            session2.warning(
              "Always matches, making the & predicate redundant.",
              node.expression.location
            );
          } else if (node.expression.match === NEVER_MATCH) {
            session2.warning(
              "Never matches, making the & predicate always fail.",
              node.expression.location
            );
          }
        },
        /**
         * @param {PEG.ast.Prefixed} node
         */
        simple_not(node) {
          visit(node.expression);
          if (node.expression.match === ALWAYS_MATCH) {
            session2.warning(
              "Always matches, making the ! predicate always fail.",
              node.expression.location
            );
          } else if (node.expression.match === NEVER_MATCH) {
            session2.warning(
              "Never matches, making the ! predicate redundant.",
              node.expression.location
            );
          }
        }
      });
      visit(ast2);
    }
    module2.exports = reportUnreachable2;
  }
});

// ../../node_modules/peggy/lib/compiler/session.js
var require_session = __commonJS({
  "../../node_modules/peggy/lib/compiler/session.js"(exports2, module2) {
    "use strict";
    var GrammarError = require_grammar_error();
    var Defaults = class {
      constructor(options2) {
        options2 = typeof options2 !== "undefined" ? options2 : {};
        if (typeof options2.error === "function") {
          this.error = options2.error;
        }
        if (typeof options2.warning === "function") {
          this.warning = options2.warning;
        }
        if (typeof options2.info === "function") {
          this.info = options2.info;
        }
      }
      // eslint-disable-next-line class-methods-use-this -- Abstract
      error() {
      }
      // eslint-disable-next-line class-methods-use-this -- Abstract
      warning() {
      }
      // eslint-disable-next-line class-methods-use-this -- Abstract
      info() {
      }
    };
    var Session2 = class {
      constructor(options2) {
        this._callbacks = new Defaults(options2);
        this._firstError = null;
        this.errors = 0;
        this.problems = [];
        this.stage = null;
      }
      error(...args) {
        ++this.errors;
        if (this._firstError === null) {
          this._firstError = new GrammarError(...args);
          this._firstError.stage = this.stage;
          this._firstError.problems = this.problems;
        }
        this.problems.push(["error", ...args]);
        this._callbacks.error(this.stage, ...args);
      }
      warning(...args) {
        this.problems.push(["warning", ...args]);
        this._callbacks.warning(this.stage, ...args);
      }
      info(...args) {
        this.problems.push(["info", ...args]);
        this._callbacks.info(this.stage, ...args);
      }
      checkErrors() {
        if (this.errors !== 0) {
          throw this._firstError;
        }
      }
    };
    module2.exports = Session2;
  }
});

// ../../node_modules/peggy/lib/compiler/index.js
var require_compiler = __commonJS({
  "../../node_modules/peggy/lib/compiler/index.js"(exports, module) {
    "use strict";
    var addImportedRules = require_add_imported_rules();
    var fixLibraryNumbers = require_fix_library_numbers();
    var generateBytecode = require_generate_bytecode();
    var generateJS = require_generate_js();
    var inferenceMatchResult = require_inference_match_result();
    var removeProxyRules = require_remove_proxy_rules();
    var mergeCharacterClasses = require_merge_character_classes();
    var removeUnusedRules = require_remove_unused_rules();
    var reportDuplicateImports = require_report_duplicate_imports();
    var reportDuplicateLabels = require_report_duplicate_labels();
    var reportDuplicateRules = require_report_duplicate_rules();
    var reportInfiniteRecursion = require_report_infinite_recursion();
    var reportInfiniteRepetition = require_report_infinite_repetition();
    var reportUndefinedRules = require_report_undefined_rules();
    var reportIncorrectPlucking = require_report_incorrect_plucking();
    var reportUnreachable = require_report_unreachable();
    var Session = require_session();
    var visitor = require_visitor();
    var { base64 } = require_utils();
    function processOptions(options2, defaults) {
      const processedOptions = {};
      Object.keys(options2).forEach((name) => {
        processedOptions[name] = options2[name];
      });
      Object.keys(defaults).forEach((name) => {
        if (!Object.prototype.hasOwnProperty.call(processedOptions, name)) {
          processedOptions[name] = defaults[name];
        }
      });
      return processedOptions;
    }
    function isSourceMapCapable(target) {
      if (typeof target === "string") {
        return target.length > 0;
      }
      return target && typeof target.offset === "function";
    }
    var compiler = {
      // AST node visitor builder. Useful mainly for plugins which manipulate the
      // AST.
      visitor,
      // Compiler passes.
      //
      // Each pass is a function that is passed the AST. It can perform checks on it
      // or modify it as needed. If the pass encounters a semantic error, it throws
      // |peg.GrammarError|.
      passes: {
        prepare: [
          addImportedRules,
          reportInfiniteRecursion
        ],
        check: [
          reportUndefinedRules,
          reportDuplicateRules,
          reportDuplicateLabels,
          reportInfiniteRepetition,
          reportIncorrectPlucking,
          reportDuplicateImports
        ],
        transform: [
          fixLibraryNumbers,
          removeProxyRules,
          mergeCharacterClasses,
          removeUnusedRules,
          inferenceMatchResult
        ],
        semantic: [
          reportUnreachable
          // Not a transform, but has to be after inferenceMatchResult
        ],
        generate: [
          generateBytecode,
          generateJS
        ]
      },
      // Generates a parser from a specified grammar AST. Throws |peg.GrammarError|
      // if the AST contains a semantic error. Note that not all errors are detected
      // during the generation and some may protrude to the generated parser and
      // cause its malfunction.
      compile(ast, passes, options) {
        options = options !== void 0 ? options : {};
        const defaultStartRules = [ast.rules[0].name];
        options = processOptions(options, {
          allowedStartRules: defaultStartRules,
          cache: false,
          dependencies: {},
          exportVar: null,
          format: "bare",
          output: "parser",
          trace: false
        });
        if (options.allowedStartRules === null || options.allowedStartRules === void 0) {
          options.allowedStartRules = defaultStartRules;
        }
        if (!Array.isArray(options.allowedStartRules)) {
          throw new Error("allowedStartRules must be an array");
        }
        if (options.allowedStartRules.length === 0) {
          options.allowedStartRules = defaultStartRules;
        }
        const allRules = ast.rules.map((r) => r.name);
        if (options.allowedStartRules.some((r) => r === "*")) {
          options.allowedStartRules = allRules;
        } else {
          for (const rule of options.allowedStartRules) {
            if (allRules.indexOf(rule) === -1) {
              throw new Error(`Unknown start rule "${rule}"`);
            }
          }
        }
        if ((options.output === "source-and-map" || options.output === "source-with-inline-map") && !isSourceMapCapable(options.grammarSource)) {
          throw new Error("Must provide grammarSource (as a string or GrammarLocation) in order to generate source maps");
        }
        const session = new Session(options);
        Object.keys(passes).forEach((stage) => {
          session.stage = stage;
          session.info(`Process stage ${stage}`);
          passes[stage].forEach((pass) => {
            session.info(`Process pass ${stage}.${pass.name}`);
            pass(ast, options, session);
          });
          session.checkErrors();
        });
        switch (options.output) {
          case "parser":
            return (0, eval)(ast.code.toString());
          case "source":
            return ast.code.toString();
          case "source-and-map":
            return ast.code;
          case "source-with-inline-map": {
            if (typeof TextEncoder === "undefined") {
              throw new Error("TextEncoder is not supported by this platform");
            }
            const sourceMap = ast.code.toStringWithSourceMap();
            const encoder = new TextEncoder();
            const b64 = base64(
              encoder.encode(JSON.stringify(sourceMap.map.toJSON()))
            );
            return sourceMap.code + "//# " + `sourceMappingURL=data:application/json;charset=utf-8;base64,${b64}\n`;
          }
          case "ast":
            return ast;
          default:
            throw new Error("Invalid output format: " + options.output + ".");
        }
      }
    };
    module.exports = compiler;
  }
});

// ../../node_modules/peggy/lib/peg.js
var require_peg = __commonJS({
  "../../node_modules/peggy/lib/peg.js"(exports2, module2) {
    "use strict";
    var GrammarError = require_grammar_error();
    var GrammarLocation = require_grammar_location();
    var asts = require_asts();
    var compiler2 = require_compiler();
    var parser4 = require_parser();
    var { version: VERSION } = require_version();
    var RESERVED_WORDS = [
      // Reserved keywords as of ECMAScript 2015
      "break",
      "case",
      "catch",
      "class",
      "const",
      "continue",
      "debugger",
      "default",
      "delete",
      "do",
      "else",
      "export",
      "extends",
      "finally",
      "for",
      "function",
      "if",
      "import",
      "in",
      "instanceof",
      "new",
      "return",
      "super",
      "switch",
      "this",
      "throw",
      "try",
      "typeof",
      "var",
      "void",
      "while",
      "with",
      // Special constants
      "null",
      "true",
      "false",
      // These are always reserved:
      "enum",
      // The following are only reserved when they are found in strict mode code
      // Peggy generates code in strict mode, so they are applicable
      "implements",
      "interface",
      "let",
      "package",
      "private",
      "protected",
      "public",
      "static",
      "yield",
      // The following are only reserved when they are found in module code:
      "await",
      // The following are reserved as future keywords by ECMAScript 1..3
      // specifications, but not any more in modern ECMAScript. We don't need these
      // because the code-generation of Peggy only targets ECMAScript >= 5.
      //
      // - abstract
      // - boolean
      // - byte
      // - char
      // - double
      // - final
      // - float
      // - goto
      // - int
      // - long
      // - native
      // - short
      // - synchronized
      // - throws
      // - transient
      // - volatile
      // These are not reserved keywords, but using them as variable names is problematic.
      "arguments",
      // Conflicts with a special variable available inside functions.
      "eval"
      // Redeclaring eval() is prohibited in strict mode
      // A few identifiers have a special meaning in some contexts without being
      // reserved words of any kind. These we don't need to worry about as they can
      // all be safely used as variable names.
      //
      // - as
      // - async
      // - from
      // - get
      // - of
      // - set
    ];
    var peg = {
      // Peggy version (filled in by /tools/release).
      VERSION,
      /**
       * Default list of reserved words. Contains list of currently and future
       * JavaScript (ECMAScript 2015) reserved words.
       *
       * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Lexical_grammar#reserved_words
       */
      RESERVED_WORDS,
      GrammarError,
      GrammarLocation,
      parser: parser4,
      compiler: compiler2,
      // Generates a parser from a specified grammar and returns it.
      //
      // The grammar must be a string in the format described by the meta-grammar in
      // the parser.pegjs file.
      //
      // Throws |peg.parser.SyntaxError| if the grammar contains a syntax error or
      // |peg.GrammarError| if it contains a semantic error. Note that not all
      // errors are detected during the generation and some may protrude to the
      // generated parser and cause its malfunction.
      generate(grammar, options2) {
        options2 = options2 !== void 0 ? options2 : {};
        function copyPasses(passes2) {
          const converted = {};
          Object.keys(passes2).forEach((stage) => {
            converted[stage] = passes2[stage].slice();
          });
          return converted;
        }
        const plugins = "plugins" in options2 ? options2.plugins : [];
        const config = {
          parser: peg.parser,
          passes: copyPasses(peg.compiler.passes),
          reservedWords: peg.RESERVED_WORDS.slice()
        };
        plugins.forEach((p) => {
          p.use(config, options2);
        });
        if (!Array.isArray(grammar)) {
          grammar = [{
            source: options2.grammarSource,
            text: grammar
          }];
        }
        const combined = asts.combine(
          grammar.map(({ source, text }) => config.parser.parse(text, {
            grammarSource: source,
            reservedWords: config.reservedWords
          }))
        );
        return peg.compiler.compile(
          combined,
          config.passes,
          options2
        );
      }
    };
    module2.exports = peg;
  }
});

// ../../node_modules/js-yaml/dist/js-yaml.mjs
function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
var jsYaml = {};
var loader = {};
var common = {};
var hasRequiredCommon;
function requireCommon() {
  if (hasRequiredCommon) return common;
  hasRequiredCommon = 1;
  function isNothing(subject) {
    return typeof subject === "undefined" || subject === null;
  }
  function isObject(subject) {
    return typeof subject === "object" && subject !== null;
  }
  function toArray(sequence) {
    if (Array.isArray(sequence)) return sequence;
    else if (isNothing(sequence)) return [];
    return [sequence];
  }
  function extend(target, source) {
    if (source) {
      const sourceKeys = Object.keys(source);
      for (let index = 0, length = sourceKeys.length; index < length; index += 1) {
        const key = sourceKeys[index];
        target[key] = source[key];
      }
    }
    return target;
  }
  function repeat(string, count) {
    let result = "";
    for (let cycle = 0; cycle < count; cycle += 1) {
      result += string;
    }
    return result;
  }
  function isNegativeZero(number) {
    return number === 0 && Number.NEGATIVE_INFINITY === 1 / number;
  }
  common.isNothing = isNothing;
  common.isObject = isObject;
  common.toArray = toArray;
  common.repeat = repeat;
  common.isNegativeZero = isNegativeZero;
  common.extend = extend;
  return common;
}
var exception;
var hasRequiredException;
function requireException() {
  if (hasRequiredException) return exception;
  hasRequiredException = 1;
  function formatError(exception2, compact) {
    let where = "";
    const message = exception2.reason || "(unknown reason)";
    if (!exception2.mark) return message;
    if (exception2.mark.name) {
      where += 'in "' + exception2.mark.name + '" ';
    }
    where += "(" + (exception2.mark.line + 1) + ":" + (exception2.mark.column + 1) + ")";
    if (!compact && exception2.mark.snippet) {
      where += "\n\n" + exception2.mark.snippet;
    }
    return message + " " + where;
  }
  function YAMLException2(reason, mark) {
    Error.call(this);
    this.name = "YAMLException";
    this.reason = reason;
    this.mark = mark;
    this.message = formatError(this, false);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = new Error().stack || "";
    }
  }
  YAMLException2.prototype = Object.create(Error.prototype);
  YAMLException2.prototype.constructor = YAMLException2;
  YAMLException2.prototype.toString = function toString(compact) {
    return this.name + ": " + formatError(this, compact);
  };
  exception = YAMLException2;
  return exception;
}
var snippet;
var hasRequiredSnippet;
function requireSnippet() {
  if (hasRequiredSnippet) return snippet;
  hasRequiredSnippet = 1;
  const common2 = requireCommon();
  function getLine(buffer, lineStart, lineEnd, position, maxLineLength) {
    let head = "";
    let tail = "";
    const maxHalfLength = Math.floor(maxLineLength / 2) - 1;
    if (position - lineStart > maxHalfLength) {
      head = " ... ";
      lineStart = position - maxHalfLength + head.length;
    }
    if (lineEnd - position > maxHalfLength) {
      tail = " ...";
      lineEnd = position + maxHalfLength - tail.length;
    }
    return {
      str: head + buffer.slice(lineStart, lineEnd).replace(/\t/g, "\u2192") + tail,
      pos: position - lineStart + head.length
      // relative position
    };
  }
  function padStart(string, max) {
    return common2.repeat(" ", max - string.length) + string;
  }
  function makeSnippet(mark, options2) {
    options2 = Object.create(options2 || null);
    if (!mark.buffer) return null;
    if (!options2.maxLength) options2.maxLength = 79;
    if (typeof options2.indent !== "number") options2.indent = 1;
    if (typeof options2.linesBefore !== "number") options2.linesBefore = 3;
    if (typeof options2.linesAfter !== "number") options2.linesAfter = 2;
    const re = /\r?\n|\r|\0/g;
    const lineStarts = [0];
    const lineEnds = [];
    let match;
    let foundLineNo = -1;
    while (match = re.exec(mark.buffer)) {
      lineEnds.push(match.index);
      lineStarts.push(match.index + match[0].length);
      if (mark.position <= match.index && foundLineNo < 0) {
        foundLineNo = lineStarts.length - 2;
      }
    }
    if (foundLineNo < 0) foundLineNo = lineStarts.length - 1;
    let result = "";
    const lineNoLength = Math.min(mark.line + options2.linesAfter, lineEnds.length).toString().length;
    const maxLineLength = options2.maxLength - (options2.indent + lineNoLength + 3);
    for (let i = 1; i <= options2.linesBefore; i++) {
      if (foundLineNo - i < 0) break;
      const line2 = getLine(
        mark.buffer,
        lineStarts[foundLineNo - i],
        lineEnds[foundLineNo - i],
        mark.position - (lineStarts[foundLineNo] - lineStarts[foundLineNo - i]),
        maxLineLength
      );
      result = common2.repeat(" ", options2.indent) + padStart((mark.line - i + 1).toString(), lineNoLength) + " | " + line2.str + "\n" + result;
    }
    const line = getLine(mark.buffer, lineStarts[foundLineNo], lineEnds[foundLineNo], mark.position, maxLineLength);
    result += common2.repeat(" ", options2.indent) + padStart((mark.line + 1).toString(), lineNoLength) + " | " + line.str + "\n";
    result += common2.repeat("-", options2.indent + lineNoLength + 3 + line.pos) + "^\n";
    for (let i = 1; i <= options2.linesAfter; i++) {
      if (foundLineNo + i >= lineEnds.length) break;
      const line2 = getLine(
        mark.buffer,
        lineStarts[foundLineNo + i],
        lineEnds[foundLineNo + i],
        mark.position - (lineStarts[foundLineNo] - lineStarts[foundLineNo + i]),
        maxLineLength
      );
      result += common2.repeat(" ", options2.indent) + padStart((mark.line + i + 1).toString(), lineNoLength) + " | " + line2.str + "\n";
    }
    return result.replace(/\n$/, "");
  }
  snippet = makeSnippet;
  return snippet;
}
var type;
var hasRequiredType;
function requireType() {
  if (hasRequiredType) return type;
  hasRequiredType = 1;
  const YAMLException2 = requireException();
  const TYPE_CONSTRUCTOR_OPTIONS = [
    "kind",
    "multi",
    "resolve",
    "construct",
    "instanceOf",
    "predicate",
    "represent",
    "representName",
    "defaultStyle",
    "styleAliases"
  ];
  const YAML_NODE_KINDS = [
    "scalar",
    "sequence",
    "mapping"
  ];
  function compileStyleAliases(map2) {
    const result = {};
    if (map2 !== null) {
      Object.keys(map2).forEach(function(style) {
        map2[style].forEach(function(alias) {
          result[String(alias)] = style;
        });
      });
    }
    return result;
  }
  function Type2(tag, options2) {
    options2 = options2 || {};
    Object.keys(options2).forEach(function(name) {
      if (TYPE_CONSTRUCTOR_OPTIONS.indexOf(name) === -1) {
        throw new YAMLException2('Unknown option "' + name + '" is met in definition of "' + tag + '" YAML type.');
      }
    });
    this.options = options2;
    this.tag = tag;
    this.kind = options2["kind"] || null;
    this.resolve = options2["resolve"] || function() {
      return true;
    };
    this.construct = options2["construct"] || function(data) {
      return data;
    };
    this.instanceOf = options2["instanceOf"] || null;
    this.predicate = options2["predicate"] || null;
    this.represent = options2["represent"] || null;
    this.representName = options2["representName"] || null;
    this.defaultStyle = options2["defaultStyle"] || null;
    this.multi = options2["multi"] || false;
    this.styleAliases = compileStyleAliases(options2["styleAliases"] || null);
    if (YAML_NODE_KINDS.indexOf(this.kind) === -1) {
      throw new YAMLException2('Unknown kind "' + this.kind + '" is specified for "' + tag + '" YAML type.');
    }
  }
  type = Type2;
  return type;
}
var schema;
var hasRequiredSchema;
function requireSchema() {
  if (hasRequiredSchema) return schema;
  hasRequiredSchema = 1;
  const YAMLException2 = requireException();
  const Type2 = requireType();
  function compileList(schema2, name) {
    const result = [];
    schema2[name].forEach(function(currentType) {
      let newIndex = result.length;
      result.forEach(function(previousType, previousIndex) {
        if (previousType.tag === currentType.tag && previousType.kind === currentType.kind && previousType.multi === currentType.multi) {
          newIndex = previousIndex;
        }
      });
      result[newIndex] = currentType;
    });
    return result;
  }
  function compileMap() {
    const result = {
      scalar: {},
      sequence: {},
      mapping: {},
      fallback: {},
      multi: {
        scalar: [],
        sequence: [],
        mapping: [],
        fallback: []
      }
    };
    function collectType(type2) {
      if (type2.multi) {
        result.multi[type2.kind].push(type2);
        result.multi["fallback"].push(type2);
      } else {
        result[type2.kind][type2.tag] = result["fallback"][type2.tag] = type2;
      }
    }
    for (let index = 0, length = arguments.length; index < length; index += 1) {
      arguments[index].forEach(collectType);
    }
    return result;
  }
  function Schema2(definition) {
    return this.extend(definition);
  }
  Schema2.prototype.extend = function extend(definition) {
    let implicit = [];
    let explicit = [];
    if (definition instanceof Type2) {
      explicit.push(definition);
    } else if (Array.isArray(definition)) {
      explicit = explicit.concat(definition);
    } else if (definition && (Array.isArray(definition.implicit) || Array.isArray(definition.explicit))) {
      if (definition.implicit) implicit = implicit.concat(definition.implicit);
      if (definition.explicit) explicit = explicit.concat(definition.explicit);
    } else {
      throw new YAMLException2("Schema.extend argument should be a Type, [ Type ], or a schema definition ({ implicit: [...], explicit: [...] })");
    }
    implicit.forEach(function(type2) {
      if (!(type2 instanceof Type2)) {
        throw new YAMLException2("Specified list of YAML types (or a single Type object) contains a non-Type object.");
      }
      if (type2.loadKind && type2.loadKind !== "scalar") {
        throw new YAMLException2("There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.");
      }
      if (type2.multi) {
        throw new YAMLException2("There is a multi type in the implicit list of a schema. Multi tags can only be listed as explicit.");
      }
    });
    explicit.forEach(function(type2) {
      if (!(type2 instanceof Type2)) {
        throw new YAMLException2("Specified list of YAML types (or a single Type object) contains a non-Type object.");
      }
    });
    const result = Object.create(Schema2.prototype);
    result.implicit = (this.implicit || []).concat(implicit);
    result.explicit = (this.explicit || []).concat(explicit);
    result.compiledImplicit = compileList(result, "implicit");
    result.compiledExplicit = compileList(result, "explicit");
    result.compiledTypeMap = compileMap(result.compiledImplicit, result.compiledExplicit);
    return result;
  };
  schema = Schema2;
  return schema;
}
var str;
var hasRequiredStr;
function requireStr() {
  if (hasRequiredStr) return str;
  hasRequiredStr = 1;
  const Type2 = requireType();
  str = new Type2("tag:yaml.org,2002:str", {
    kind: "scalar",
    construct: function(data) {
      return data !== null ? data : "";
    }
  });
  return str;
}
var seq;
var hasRequiredSeq;
function requireSeq() {
  if (hasRequiredSeq) return seq;
  hasRequiredSeq = 1;
  const Type2 = requireType();
  seq = new Type2("tag:yaml.org,2002:seq", {
    kind: "sequence",
    construct: function(data) {
      return data !== null ? data : [];
    }
  });
  return seq;
}
var map;
var hasRequiredMap;
function requireMap() {
  if (hasRequiredMap) return map;
  hasRequiredMap = 1;
  const Type2 = requireType();
  map = new Type2("tag:yaml.org,2002:map", {
    kind: "mapping",
    construct: function(data) {
      return data !== null ? data : {};
    }
  });
  return map;
}
var failsafe;
var hasRequiredFailsafe;
function requireFailsafe() {
  if (hasRequiredFailsafe) return failsafe;
  hasRequiredFailsafe = 1;
  const Schema2 = requireSchema();
  failsafe = new Schema2({
    explicit: [
      requireStr(),
      requireSeq(),
      requireMap()
    ]
  });
  return failsafe;
}
var _null;
var hasRequired_null;
function require_null() {
  if (hasRequired_null) return _null;
  hasRequired_null = 1;
  const Type2 = requireType();
  function resolveYamlNull(data) {
    if (data === null) return true;
    const max = data.length;
    return max === 1 && data === "~" || max === 4 && (data === "null" || data === "Null" || data === "NULL");
  }
  function constructYamlNull() {
    return null;
  }
  function isNull(object) {
    return object === null;
  }
  _null = new Type2("tag:yaml.org,2002:null", {
    kind: "scalar",
    resolve: resolveYamlNull,
    construct: constructYamlNull,
    predicate: isNull,
    represent: {
      canonical: function() {
        return "~";
      },
      lowercase: function() {
        return "null";
      },
      uppercase: function() {
        return "NULL";
      },
      camelcase: function() {
        return "Null";
      },
      empty: function() {
        return "";
      }
    },
    defaultStyle: "lowercase"
  });
  return _null;
}
var bool;
var hasRequiredBool;
function requireBool() {
  if (hasRequiredBool) return bool;
  hasRequiredBool = 1;
  const Type2 = requireType();
  function resolveYamlBoolean(data) {
    if (data === null) return false;
    const max = data.length;
    return max === 4 && (data === "true" || data === "True" || data === "TRUE") || max === 5 && (data === "false" || data === "False" || data === "FALSE");
  }
  function constructYamlBoolean(data) {
    return data === "true" || data === "True" || data === "TRUE";
  }
  function isBoolean(object) {
    return Object.prototype.toString.call(object) === "[object Boolean]";
  }
  bool = new Type2("tag:yaml.org,2002:bool", {
    kind: "scalar",
    resolve: resolveYamlBoolean,
    construct: constructYamlBoolean,
    predicate: isBoolean,
    represent: {
      lowercase: function(object) {
        return object ? "true" : "false";
      },
      uppercase: function(object) {
        return object ? "TRUE" : "FALSE";
      },
      camelcase: function(object) {
        return object ? "True" : "False";
      }
    },
    defaultStyle: "lowercase"
  });
  return bool;
}
var int;
var hasRequiredInt;
function requireInt() {
  if (hasRequiredInt) return int;
  hasRequiredInt = 1;
  const common2 = requireCommon();
  const Type2 = requireType();
  function isHexCode(c) {
    return c >= 48 && c <= 57 || c >= 65 && c <= 70 || c >= 97 && c <= 102;
  }
  function isOctCode(c) {
    return c >= 48 && c <= 55;
  }
  function isDecCode(c) {
    return c >= 48 && c <= 57;
  }
  function resolveYamlInteger(data) {
    if (data === null) return false;
    const max = data.length;
    let index = 0;
    let hasDigits = false;
    if (!max) return false;
    let ch = data[index];
    if (ch === "-" || ch === "+") {
      ch = data[++index];
    }
    if (ch === "0") {
      if (index + 1 === max) return true;
      ch = data[++index];
      if (ch === "b") {
        index++;
        for (; index < max; index++) {
          ch = data[index];
          if (ch !== "0" && ch !== "1") return false;
          hasDigits = true;
        }
        return hasDigits && isFinite(parseYamlInteger(data));
      }
      if (ch === "x") {
        index++;
        for (; index < max; index++) {
          if (!isHexCode(data.charCodeAt(index))) return false;
          hasDigits = true;
        }
        return hasDigits && isFinite(parseYamlInteger(data));
      }
      if (ch === "o") {
        index++;
        for (; index < max; index++) {
          if (!isOctCode(data.charCodeAt(index))) return false;
          hasDigits = true;
        }
        return hasDigits && isFinite(parseYamlInteger(data));
      }
    }
    for (; index < max; index++) {
      if (!isDecCode(data.charCodeAt(index))) {
        return false;
      }
      hasDigits = true;
    }
    if (!hasDigits) return false;
    return isFinite(parseYamlInteger(data));
  }
  function parseYamlInteger(data) {
    let value = data;
    let sign = 1;
    let ch = value[0];
    if (ch === "-" || ch === "+") {
      if (ch === "-") sign = -1;
      value = value.slice(1);
      ch = value[0];
    }
    if (value === "0") return 0;
    if (ch === "0") {
      if (value[1] === "b") return sign * parseInt(value.slice(2), 2);
      if (value[1] === "x") return sign * parseInt(value.slice(2), 16);
      if (value[1] === "o") return sign * parseInt(value.slice(2), 8);
    }
    return sign * parseInt(value, 10);
  }
  function constructYamlInteger(data) {
    return parseYamlInteger(data);
  }
  function isInteger(object) {
    return Object.prototype.toString.call(object) === "[object Number]" && (object % 1 === 0 && !common2.isNegativeZero(object));
  }
  int = new Type2("tag:yaml.org,2002:int", {
    kind: "scalar",
    resolve: resolveYamlInteger,
    construct: constructYamlInteger,
    predicate: isInteger,
    represent: {
      binary: function(obj) {
        return obj >= 0 ? "0b" + obj.toString(2) : "-0b" + obj.toString(2).slice(1);
      },
      octal: function(obj) {
        return obj >= 0 ? "0o" + obj.toString(8) : "-0o" + obj.toString(8).slice(1);
      },
      decimal: function(obj) {
        return obj.toString(10);
      },
      hexadecimal: function(obj) {
        return obj >= 0 ? "0x" + obj.toString(16).toUpperCase() : "-0x" + obj.toString(16).toUpperCase().slice(1);
      }
    },
    defaultStyle: "decimal",
    styleAliases: {
      binary: [2, "bin"],
      octal: [8, "oct"],
      decimal: [10, "dec"],
      hexadecimal: [16, "hex"]
    }
  });
  return int;
}
var float;
var hasRequiredFloat;
function requireFloat() {
  if (hasRequiredFloat) return float;
  hasRequiredFloat = 1;
  const common2 = requireCommon();
  const Type2 = requireType();
  const YAML_FLOAT_PATTERN = new RegExp(
    // 2.5e4, 2.5 and integers
    "^(?:[-+]?(?:[0-9]+)(?:\\.[0-9]*)?(?:[eE][-+]?[0-9]+)?|\\.[0-9]+(?:[eE][-+]?[0-9]+)?|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$"
  );
  const YAML_FLOAT_SPECIAL_PATTERN = new RegExp(
    "^(?:[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$"
  );
  function resolveYamlFloat(data) {
    if (data === null) return false;
    if (!YAML_FLOAT_PATTERN.test(data)) {
      return false;
    }
    if (isFinite(parseFloat(data, 10))) {
      return true;
    }
    return YAML_FLOAT_SPECIAL_PATTERN.test(data);
  }
  function constructYamlFloat(data) {
    let value = data.toLowerCase();
    const sign = value[0] === "-" ? -1 : 1;
    if ("+-".indexOf(value[0]) >= 0) {
      value = value.slice(1);
    }
    if (value === ".inf") {
      return sign === 1 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
    } else if (value === ".nan") {
      return NaN;
    }
    return sign * parseFloat(value, 10);
  }
  const SCIENTIFIC_WITHOUT_DOT = /^[-+]?[0-9]+e/;
  function representYamlFloat(object, style) {
    if (isNaN(object)) {
      switch (style) {
        case "lowercase":
          return ".nan";
        case "uppercase":
          return ".NAN";
        case "camelcase":
          return ".NaN";
      }
    } else if (Number.POSITIVE_INFINITY === object) {
      switch (style) {
        case "lowercase":
          return ".inf";
        case "uppercase":
          return ".INF";
        case "camelcase":
          return ".Inf";
      }
    } else if (Number.NEGATIVE_INFINITY === object) {
      switch (style) {
        case "lowercase":
          return "-.inf";
        case "uppercase":
          return "-.INF";
        case "camelcase":
          return "-.Inf";
      }
    } else if (common2.isNegativeZero(object)) {
      return "-0.0";
    }
    const res = object.toString(10);
    return SCIENTIFIC_WITHOUT_DOT.test(res) ? res.replace("e", ".e") : res;
  }
  function isFloat(object) {
    return Object.prototype.toString.call(object) === "[object Number]" && (object % 1 !== 0 || common2.isNegativeZero(object));
  }
  float = new Type2("tag:yaml.org,2002:float", {
    kind: "scalar",
    resolve: resolveYamlFloat,
    construct: constructYamlFloat,
    predicate: isFloat,
    represent: representYamlFloat,
    defaultStyle: "lowercase"
  });
  return float;
}
var json;
var hasRequiredJson;
function requireJson() {
  if (hasRequiredJson) return json;
  hasRequiredJson = 1;
  json = requireFailsafe().extend({
    implicit: [
      require_null(),
      requireBool(),
      requireInt(),
      requireFloat()
    ]
  });
  return json;
}
var core;
var hasRequiredCore;
function requireCore() {
  if (hasRequiredCore) return core;
  hasRequiredCore = 1;
  core = requireJson();
  return core;
}
var timestamp;
var hasRequiredTimestamp;
function requireTimestamp() {
  if (hasRequiredTimestamp) return timestamp;
  hasRequiredTimestamp = 1;
  const Type2 = requireType();
  const YAML_DATE_REGEXP = new RegExp(
    "^([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9])$"
  );
  const YAML_TIMESTAMP_REGEXP = new RegExp(
    "^([0-9][0-9][0-9][0-9])-([0-9][0-9]?)-([0-9][0-9]?)(?:[Tt]|[ \\t]+)([0-9][0-9]?):([0-9][0-9]):([0-9][0-9])(?:\\.([0-9]*))?(?:[ \\t]*(Z|([-+])([0-9][0-9]?)(?::([0-9][0-9]))?))?$"
  );
  function resolveYamlTimestamp(data) {
    if (data === null) return false;
    if (YAML_DATE_REGEXP.exec(data) !== null) return true;
    if (YAML_TIMESTAMP_REGEXP.exec(data) !== null) return true;
    return false;
  }
  function constructYamlTimestamp(data) {
    let fraction = 0;
    let delta = null;
    let match = YAML_DATE_REGEXP.exec(data);
    if (match === null) match = YAML_TIMESTAMP_REGEXP.exec(data);
    if (match === null) throw new Error("Date resolve error");
    const year = +match[1];
    const month = +match[2] - 1;
    const day = +match[3];
    if (!match[4]) {
      return new Date(Date.UTC(year, month, day));
    }
    const hour = +match[4];
    const minute = +match[5];
    const second = +match[6];
    if (match[7]) {
      fraction = match[7].slice(0, 3);
      while (fraction.length < 3) {
        fraction += "0";
      }
      fraction = +fraction;
    }
    if (match[9]) {
      const tzHour = +match[10];
      const tzMinute = +(match[11] || 0);
      delta = (tzHour * 60 + tzMinute) * 6e4;
      if (match[9] === "-") delta = -delta;
    }
    const date = new Date(Date.UTC(year, month, day, hour, minute, second, fraction));
    if (delta) date.setTime(date.getTime() - delta);
    return date;
  }
  function representYamlTimestamp(object) {
    return object.toISOString();
  }
  timestamp = new Type2("tag:yaml.org,2002:timestamp", {
    kind: "scalar",
    resolve: resolveYamlTimestamp,
    construct: constructYamlTimestamp,
    instanceOf: Date,
    represent: representYamlTimestamp
  });
  return timestamp;
}
var merge;
var hasRequiredMerge;
function requireMerge() {
  if (hasRequiredMerge) return merge;
  hasRequiredMerge = 1;
  const Type2 = requireType();
  function resolveYamlMerge(data) {
    return data === "<<" || data === null;
  }
  merge = new Type2("tag:yaml.org,2002:merge", {
    kind: "scalar",
    resolve: resolveYamlMerge
  });
  return merge;
}
var binary;
var hasRequiredBinary;
function requireBinary() {
  if (hasRequiredBinary) return binary;
  hasRequiredBinary = 1;
  const Type2 = requireType();
  const BASE64_MAP = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=\n\r";
  function resolveYamlBinary(data) {
    if (data === null) return false;
    let bitlen = 0;
    const max = data.length;
    const map2 = BASE64_MAP;
    for (let idx = 0; idx < max; idx++) {
      const code = map2.indexOf(data.charAt(idx));
      if (code > 64) continue;
      if (code < 0) return false;
      bitlen += 6;
    }
    return bitlen % 8 === 0;
  }
  function constructYamlBinary(data) {
    const input = data.replace(/[\r\n=]/g, "");
    const max = input.length;
    const map2 = BASE64_MAP;
    let bits = 0;
    const result = [];
    for (let idx = 0; idx < max; idx++) {
      if (idx % 4 === 0 && idx) {
        result.push(bits >> 16 & 255);
        result.push(bits >> 8 & 255);
        result.push(bits & 255);
      }
      bits = bits << 6 | map2.indexOf(input.charAt(idx));
    }
    const tailbits = max % 4 * 6;
    if (tailbits === 0) {
      result.push(bits >> 16 & 255);
      result.push(bits >> 8 & 255);
      result.push(bits & 255);
    } else if (tailbits === 18) {
      result.push(bits >> 10 & 255);
      result.push(bits >> 2 & 255);
    } else if (tailbits === 12) {
      result.push(bits >> 4 & 255);
    }
    return new Uint8Array(result);
  }
  function representYamlBinary(object) {
    let result = "";
    let bits = 0;
    const max = object.length;
    const map2 = BASE64_MAP;
    for (let idx = 0; idx < max; idx++) {
      if (idx % 3 === 0 && idx) {
        result += map2[bits >> 18 & 63];
        result += map2[bits >> 12 & 63];
        result += map2[bits >> 6 & 63];
        result += map2[bits & 63];
      }
      bits = (bits << 8) + object[idx];
    }
    const tail = max % 3;
    if (tail === 0) {
      result += map2[bits >> 18 & 63];
      result += map2[bits >> 12 & 63];
      result += map2[bits >> 6 & 63];
      result += map2[bits & 63];
    } else if (tail === 2) {
      result += map2[bits >> 10 & 63];
      result += map2[bits >> 4 & 63];
      result += map2[bits << 2 & 63];
      result += map2[64];
    } else if (tail === 1) {
      result += map2[bits >> 2 & 63];
      result += map2[bits << 4 & 63];
      result += map2[64];
      result += map2[64];
    }
    return result;
  }
  function isBinary(obj) {
    return Object.prototype.toString.call(obj) === "[object Uint8Array]";
  }
  binary = new Type2("tag:yaml.org,2002:binary", {
    kind: "scalar",
    resolve: resolveYamlBinary,
    construct: constructYamlBinary,
    predicate: isBinary,
    represent: representYamlBinary
  });
  return binary;
}
var omap;
var hasRequiredOmap;
function requireOmap() {
  if (hasRequiredOmap) return omap;
  hasRequiredOmap = 1;
  const Type2 = requireType();
  const _hasOwnProperty = Object.prototype.hasOwnProperty;
  const _toString = Object.prototype.toString;
  function resolveYamlOmap(data) {
    if (data === null) return true;
    const objectKeys = {};
    const object = data;
    for (let index = 0, length = object.length; index < length; index += 1) {
      const pair = object[index];
      let pairHasKey = false;
      if (_toString.call(pair) !== "[object Object]") return false;
      let pairKey;
      for (pairKey in pair) {
        if (_hasOwnProperty.call(pair, pairKey)) {
          if (!pairHasKey) pairHasKey = true;
          else return false;
        }
      }
      if (!pairHasKey) return false;
      if (_hasOwnProperty.call(objectKeys, pairKey)) return false;
      Object.defineProperty(objectKeys, pairKey, { value: true });
    }
    return true;
  }
  function constructYamlOmap(data) {
    return data !== null ? data : [];
  }
  omap = new Type2("tag:yaml.org,2002:omap", {
    kind: "sequence",
    resolve: resolveYamlOmap,
    construct: constructYamlOmap
  });
  return omap;
}
var pairs;
var hasRequiredPairs;
function requirePairs() {
  if (hasRequiredPairs) return pairs;
  hasRequiredPairs = 1;
  const Type2 = requireType();
  const _toString = Object.prototype.toString;
  function resolveYamlPairs(data) {
    if (data === null) return true;
    const object = data;
    const result = new Array(object.length);
    for (let index = 0, length = object.length; index < length; index += 1) {
      const pair = object[index];
      if (_toString.call(pair) !== "[object Object]") return false;
      const keys = Object.keys(pair);
      if (keys.length !== 1) return false;
      result[index] = [keys[0], pair[keys[0]]];
    }
    return true;
  }
  function constructYamlPairs(data) {
    if (data === null) return [];
    const object = data;
    const result = new Array(object.length);
    for (let index = 0, length = object.length; index < length; index += 1) {
      const pair = object[index];
      const keys = Object.keys(pair);
      result[index] = [keys[0], pair[keys[0]]];
    }
    return result;
  }
  pairs = new Type2("tag:yaml.org,2002:pairs", {
    kind: "sequence",
    resolve: resolveYamlPairs,
    construct: constructYamlPairs
  });
  return pairs;
}
var set;
var hasRequiredSet;
function requireSet() {
  if (hasRequiredSet) return set;
  hasRequiredSet = 1;
  const Type2 = requireType();
  const _hasOwnProperty = Object.prototype.hasOwnProperty;
  function resolveYamlSet(data) {
    if (data === null) return true;
    const object = data;
    for (const key in object) {
      if (_hasOwnProperty.call(object, key)) {
        if (object[key] !== null) return false;
      }
    }
    return true;
  }
  function constructYamlSet(data) {
    return data !== null ? data : {};
  }
  set = new Type2("tag:yaml.org,2002:set", {
    kind: "mapping",
    resolve: resolveYamlSet,
    construct: constructYamlSet
  });
  return set;
}
var _default;
var hasRequired_default;
function require_default() {
  if (hasRequired_default) return _default;
  hasRequired_default = 1;
  _default = requireCore().extend({
    implicit: [
      requireTimestamp(),
      requireMerge()
    ],
    explicit: [
      requireBinary(),
      requireOmap(),
      requirePairs(),
      requireSet()
    ]
  });
  return _default;
}
var hasRequiredLoader;
function requireLoader() {
  if (hasRequiredLoader) return loader;
  hasRequiredLoader = 1;
  const common2 = requireCommon();
  const YAMLException2 = requireException();
  const makeSnippet = requireSnippet();
  const DEFAULT_SCHEMA2 = require_default();
  const _hasOwnProperty = Object.prototype.hasOwnProperty;
  const CONTEXT_FLOW_IN = 1;
  const CONTEXT_FLOW_OUT = 2;
  const CONTEXT_BLOCK_IN = 3;
  const CONTEXT_BLOCK_OUT = 4;
  const CHOMPING_CLIP = 1;
  const CHOMPING_STRIP = 2;
  const CHOMPING_KEEP = 3;
  const PATTERN_NON_PRINTABLE = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/;
  const PATTERN_NON_ASCII_LINE_BREAKS = /[\x85\u2028\u2029]/;
  const PATTERN_FLOW_INDICATORS = /[,\[\]{}]/;
  const PATTERN_TAG_HANDLE = /^(?:!|!!|![0-9A-Za-z-]+!)$/;
  const PATTERN_TAG_URI = /^(?:!|[^,\[\]{}])(?:%[0-9a-f]{2}|[0-9a-z\-#;/?:@&=+$,_.!~*'()\[\]])*$/i;
  function _class(obj) {
    return Object.prototype.toString.call(obj);
  }
  function isEol(c) {
    return c === 10 || c === 13;
  }
  function isWhiteSpace(c) {
    return c === 9 || c === 32;
  }
  function isWsOrEol(c) {
    return c === 9 || c === 32 || c === 10 || c === 13;
  }
  function isFlowIndicator(c) {
    return c === 44 || c === 91 || c === 93 || c === 123 || c === 125;
  }
  function fromHexCode(c) {
    if (c >= 48 && c <= 57) {
      return c - 48;
    }
    const lc = c | 32;
    if (lc >= 97 && lc <= 102) {
      return lc - 97 + 10;
    }
    return -1;
  }
  function escapedHexLen(c) {
    if (c === 120) {
      return 2;
    }
    if (c === 117) {
      return 4;
    }
    if (c === 85) {
      return 8;
    }
    return 0;
  }
  function fromDecimalCode(c) {
    if (c >= 48 && c <= 57) {
      return c - 48;
    }
    return -1;
  }
  function simpleEscapeSequence(c) {
    switch (c) {
      case 48:
        return "\0";
      case 97:
        return "\x07";
      case 98:
        return "\b";
      case 116:
        return "	";
      case 9:
        return "	";
      case 110:
        return "\n";
      case 118:
        return "\v";
      case 102:
        return "\f";
      case 114:
        return "\r";
      case 101:
        return "\x1B";
      case 32:
        return " ";
      case 34:
        return '"';
      case 47:
        return "/";
      case 92:
        return "\\";
      case 78:
        return "\x85";
      case 95:
        return "\xA0";
      case 76:
        return "\u2028";
      case 80:
        return "\u2029";
      default:
        return "";
    }
  }
  function charFromCodepoint(c) {
    if (c <= 65535) {
      return String.fromCharCode(c);
    }
    return String.fromCharCode(
      (c - 65536 >> 10) + 55296,
      (c - 65536 & 1023) + 56320
    );
  }
  function setProperty(object, key, value) {
    if (key === "__proto__") {
      Object.defineProperty(object, key, {
        configurable: true,
        enumerable: true,
        writable: true,
        value
      });
    } else {
      object[key] = value;
    }
  }
  const simpleEscapeCheck = new Array(256);
  const simpleEscapeMap = new Array(256);
  for (let i = 0; i < 256; i++) {
    simpleEscapeCheck[i] = simpleEscapeSequence(i) ? 1 : 0;
    simpleEscapeMap[i] = simpleEscapeSequence(i);
  }
  function State(input, options2) {
    this.input = input;
    this.filename = options2["filename"] || null;
    this.schema = options2["schema"] || DEFAULT_SCHEMA2;
    this.onWarning = options2["onWarning"] || null;
    this.legacy = options2["legacy"] || false;
    this.json = options2["json"] || false;
    this.listener = options2["listener"] || null;
    this.maxDepth = typeof options2["maxDepth"] === "number" ? options2["maxDepth"] : 100;
    this.maxTotalMergeKeys = typeof options2["maxTotalMergeKeys"] === "number" ? options2["maxTotalMergeKeys"] : 1e4;
    this.implicitTypes = this.schema.compiledImplicit;
    this.typeMap = this.schema.compiledTypeMap;
    this.length = input.length;
    this.position = 0;
    this.line = 0;
    this.lineStart = 0;
    this.lineIndent = 0;
    this.depth = 0;
    this.totalMergeKeys = 0;
    this.firstTabInLine = -1;
    this.documents = [];
    this.anchorMapTransactions = [];
  }
  function generateError(state, message) {
    const mark = {
      name: state.filename,
      buffer: state.input.slice(0, -1),
      // omit trailing \0
      position: state.position,
      line: state.line,
      column: state.position - state.lineStart
    };
    mark.snippet = makeSnippet(mark);
    return new YAMLException2(message, mark);
  }
  function throwError(state, message) {
    throw generateError(state, message);
  }
  function throwWarning(state, message) {
    if (state.onWarning) {
      state.onWarning.call(null, generateError(state, message));
    }
  }
  function storeAnchor(state, name, value) {
    const transactions = state.anchorMapTransactions;
    if (transactions.length !== 0) {
      const transaction = transactions[transactions.length - 1];
      if (!_hasOwnProperty.call(transaction, name)) {
        transaction[name] = {
          existed: _hasOwnProperty.call(state.anchorMap, name),
          value: state.anchorMap[name]
        };
      }
    }
    state.anchorMap[name] = value;
  }
  function beginAnchorTransaction(state) {
    state.anchorMapTransactions.push(/* @__PURE__ */ Object.create(null));
  }
  function commitAnchorTransaction(state) {
    const transaction = state.anchorMapTransactions.pop();
    const transactions = state.anchorMapTransactions;
    if (transactions.length === 0) return;
    const parent = transactions[transactions.length - 1];
    const names = Object.keys(transaction);
    for (let index = 0, length = names.length; index < length; index += 1) {
      const name = names[index];
      if (!_hasOwnProperty.call(parent, name)) {
        parent[name] = transaction[name];
      }
    }
  }
  function rollbackAnchorTransaction(state) {
    const transaction = state.anchorMapTransactions.pop();
    const names = Object.keys(transaction);
    for (let index = names.length - 1; index >= 0; index -= 1) {
      const entry = transaction[names[index]];
      if (entry.existed) {
        state.anchorMap[names[index]] = entry.value;
      } else {
        delete state.anchorMap[names[index]];
      }
    }
  }
  function snapshotState(state) {
    return {
      position: state.position,
      line: state.line,
      lineStart: state.lineStart,
      lineIndent: state.lineIndent,
      firstTabInLine: state.firstTabInLine,
      tag: state.tag,
      anchor: state.anchor,
      kind: state.kind,
      result: state.result
    };
  }
  function restoreState(state, snapshot) {
    state.position = snapshot.position;
    state.line = snapshot.line;
    state.lineStart = snapshot.lineStart;
    state.lineIndent = snapshot.lineIndent;
    state.firstTabInLine = snapshot.firstTabInLine;
    state.tag = snapshot.tag;
    state.anchor = snapshot.anchor;
    state.kind = snapshot.kind;
    state.result = snapshot.result;
  }
  const directiveHandlers = {
    YAML: function handleYamlDirective(state, name, args) {
      if (state.version !== null) {
        throwError(state, "duplication of %YAML directive");
      }
      if (args.length !== 1) {
        throwError(state, "YAML directive accepts exactly one argument");
      }
      const match = /^([0-9]+)\.([0-9]+)$/.exec(args[0]);
      if (match === null) {
        throwError(state, "ill-formed argument of the YAML directive");
      }
      const major = parseInt(match[1], 10);
      const minor = parseInt(match[2], 10);
      if (major !== 1) {
        throwError(state, "unacceptable YAML version of the document");
      }
      state.version = args[0];
      state.checkLineBreaks = minor < 2;
      if (minor !== 1 && minor !== 2) {
        throwWarning(state, "unsupported YAML version of the document");
      }
    },
    TAG: function handleTagDirective(state, name, args) {
      let prefix;
      if (args.length !== 2) {
        throwError(state, "TAG directive accepts exactly two arguments");
      }
      const handle = args[0];
      prefix = args[1];
      if (!PATTERN_TAG_HANDLE.test(handle)) {
        throwError(state, "ill-formed tag handle (first argument) of the TAG directive");
      }
      if (_hasOwnProperty.call(state.tagMap, handle)) {
        throwError(state, 'there is a previously declared suffix for "' + handle + '" tag handle');
      }
      if (!PATTERN_TAG_URI.test(prefix)) {
        throwError(state, "ill-formed tag prefix (second argument) of the TAG directive");
      }
      try {
        prefix = decodeURIComponent(prefix);
      } catch (err) {
        throwError(state, "tag prefix is malformed: " + prefix);
      }
      state.tagMap[handle] = prefix;
    }
  };
  function captureSegment(state, start, end, checkJson) {
    if (start < end) {
      const _result = state.input.slice(start, end);
      if (checkJson) {
        for (let _position = 0, _length = _result.length; _position < _length; _position += 1) {
          const _character = _result.charCodeAt(_position);
          if (!(_character === 9 || _character >= 32 && _character <= 1114111)) {
            throwError(state, "expected valid JSON character");
          }
        }
      } else if (PATTERN_NON_PRINTABLE.test(_result)) {
        throwError(state, "the stream contains non-printable characters");
      }
      state.result += _result;
    }
  }
  function chargeMergeWork(state) {
    state.totalMergeKeys++;
    if (state.maxTotalMergeKeys !== -1 && state.totalMergeKeys > state.maxTotalMergeKeys) {
      throwError(state, "merge keys exceeded maxTotalMergeKeys (" + state.maxTotalMergeKeys + ")");
    }
  }
  function mergeMappings(state, destination, source, overridableKeys) {
    if (!common2.isObject(source)) {
      throwError(state, "cannot merge mappings; the provided source object is unacceptable");
    }
    chargeMergeWork(state);
    const sourceKeys = Object.keys(source);
    for (let index = 0, quantity = sourceKeys.length; index < quantity; index += 1) {
      const key = sourceKeys[index];
      chargeMergeWork(state);
      if (!_hasOwnProperty.call(destination, key)) {
        setProperty(destination, key, source[key]);
        overridableKeys[key] = true;
      }
    }
  }
  function storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, startLine, startLineStart, startPos) {
    if (Array.isArray(keyNode)) {
      keyNode = Array.prototype.slice.call(keyNode);
      for (let index = 0, quantity = keyNode.length; index < quantity; index += 1) {
        if (Array.isArray(keyNode[index])) {
          throwError(state, "nested arrays are not supported inside keys");
        }
        if (typeof keyNode === "object" && _class(keyNode[index]) === "[object Object]") {
          keyNode[index] = "[object Object]";
        }
      }
    }
    if (typeof keyNode === "object" && _class(keyNode) === "[object Object]") {
      keyNode = "[object Object]";
    }
    keyNode = String(keyNode);
    if (_result === null) {
      _result = {};
    }
    if (keyTag === "tag:yaml.org,2002:merge") {
      if (Array.isArray(valueNode)) {
        if (valueNode.length > 100) {
          throwError(state, "abnormal merge sequence size");
        }
        for (let index = 0, quantity = valueNode.length; index < quantity; index += 1) {
          mergeMappings(state, _result, valueNode[index], overridableKeys);
        }
      } else {
        mergeMappings(state, _result, valueNode, overridableKeys);
      }
    } else {
      if (!state.json && !_hasOwnProperty.call(overridableKeys, keyNode) && _hasOwnProperty.call(_result, keyNode)) {
        state.line = startLine || state.line;
        state.lineStart = startLineStart || state.lineStart;
        state.position = startPos || state.position;
        throwError(state, "duplicated mapping key");
      }
      setProperty(_result, keyNode, valueNode);
      delete overridableKeys[keyNode];
    }
    return _result;
  }
  function readLineBreak(state) {
    const ch = state.input.charCodeAt(state.position);
    if (ch === 10) {
      state.position++;
    } else if (ch === 13) {
      state.position++;
      if (state.input.charCodeAt(state.position) === 10) {
        state.position++;
      }
    } else {
      throwError(state, "a line break is expected");
    }
    state.line += 1;
    state.lineStart = state.position;
    state.firstTabInLine = -1;
  }
  function skipSeparationSpace(state, allowComments, checkIndent) {
    let lineBreaks = 0;
    let ch = state.input.charCodeAt(state.position);
    while (ch !== 0) {
      while (isWhiteSpace(ch)) {
        if (ch === 9 && state.firstTabInLine === -1) {
          state.firstTabInLine = state.position;
        }
        ch = state.input.charCodeAt(++state.position);
      }
      if (allowComments && ch === 35) {
        do {
          ch = state.input.charCodeAt(++state.position);
        } while (ch !== 10 && ch !== 13 && ch !== 0);
      }
      if (isEol(ch)) {
        readLineBreak(state);
        ch = state.input.charCodeAt(state.position);
        lineBreaks++;
        state.lineIndent = 0;
        while (ch === 32) {
          state.lineIndent++;
          ch = state.input.charCodeAt(++state.position);
        }
      } else {
        break;
      }
    }
    if (checkIndent !== -1 && lineBreaks !== 0 && state.lineIndent < checkIndent) {
      throwWarning(state, "deficient indentation");
    }
    return lineBreaks;
  }
  function testDocumentSeparator(state) {
    let _position = state.position;
    let ch = state.input.charCodeAt(_position);
    if ((ch === 45 || ch === 46) && ch === state.input.charCodeAt(_position + 1) && ch === state.input.charCodeAt(_position + 2)) {
      _position += 3;
      ch = state.input.charCodeAt(_position);
      if (ch === 0 || isWsOrEol(ch)) {
        return true;
      }
    }
    return false;
  }
  function writeFoldedLines(state, count) {
    if (count === 1) {
      state.result += " ";
    } else if (count > 1) {
      state.result += common2.repeat("\n", count - 1);
    }
  }
  function readPlainScalar(state, nodeIndent, withinFlowCollection) {
    let captureStart;
    let captureEnd;
    let hasPendingContent;
    let _line;
    let _lineStart;
    let _lineIndent;
    const _kind = state.kind;
    const _result = state.result;
    let ch = state.input.charCodeAt(state.position);
    if (isWsOrEol(ch) || isFlowIndicator(ch) || ch === 35 || ch === 38 || ch === 42 || ch === 33 || ch === 124 || ch === 62 || ch === 39 || ch === 34 || ch === 37 || ch === 64 || ch === 96) {
      return false;
    }
    if (ch === 63 || ch === 45) {
      const following = state.input.charCodeAt(state.position + 1);
      if (isWsOrEol(following) || withinFlowCollection && isFlowIndicator(following)) {
        return false;
      }
    }
    state.kind = "scalar";
    state.result = "";
    captureStart = captureEnd = state.position;
    hasPendingContent = false;
    while (ch !== 0) {
      if (ch === 58) {
        const following = state.input.charCodeAt(state.position + 1);
        if (isWsOrEol(following) || withinFlowCollection && isFlowIndicator(following)) {
          break;
        }
      } else if (ch === 35) {
        const preceding = state.input.charCodeAt(state.position - 1);
        if (isWsOrEol(preceding)) {
          break;
        }
      } else if (state.position === state.lineStart && testDocumentSeparator(state) || withinFlowCollection && isFlowIndicator(ch)) {
        break;
      } else if (isEol(ch)) {
        _line = state.line;
        _lineStart = state.lineStart;
        _lineIndent = state.lineIndent;
        skipSeparationSpace(state, false, -1);
        if (state.lineIndent >= nodeIndent) {
          hasPendingContent = true;
          ch = state.input.charCodeAt(state.position);
          continue;
        } else {
          state.position = captureEnd;
          state.line = _line;
          state.lineStart = _lineStart;
          state.lineIndent = _lineIndent;
          break;
        }
      }
      if (hasPendingContent) {
        captureSegment(state, captureStart, captureEnd, false);
        writeFoldedLines(state, state.line - _line);
        captureStart = captureEnd = state.position;
        hasPendingContent = false;
      }
      if (!isWhiteSpace(ch)) {
        captureEnd = state.position + 1;
      }
      ch = state.input.charCodeAt(++state.position);
    }
    captureSegment(state, captureStart, captureEnd, false);
    if (state.result) {
      return true;
    }
    state.kind = _kind;
    state.result = _result;
    return false;
  }
  function readSingleQuotedScalar(state, nodeIndent) {
    let captureStart;
    let captureEnd;
    let ch = state.input.charCodeAt(state.position);
    if (ch !== 39) {
      return false;
    }
    state.kind = "scalar";
    state.result = "";
    state.position++;
    captureStart = captureEnd = state.position;
    while ((ch = state.input.charCodeAt(state.position)) !== 0) {
      if (ch === 39) {
        captureSegment(state, captureStart, state.position, true);
        ch = state.input.charCodeAt(++state.position);
        if (ch === 39) {
          captureStart = state.position;
          state.position++;
          captureEnd = state.position;
        } else {
          return true;
        }
      } else if (isEol(ch)) {
        captureSegment(state, captureStart, captureEnd, true);
        writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
        captureStart = captureEnd = state.position;
      } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
        throwError(state, "unexpected end of the document within a single quoted scalar");
      } else {
        state.position++;
        if (!isWhiteSpace(ch)) {
          captureEnd = state.position;
        }
      }
    }
    throwError(state, "unexpected end of the stream within a single quoted scalar");
  }
  function readDoubleQuotedScalar(state, nodeIndent) {
    let captureStart;
    let captureEnd;
    let tmp;
    let ch = state.input.charCodeAt(state.position);
    if (ch !== 34) {
      return false;
    }
    state.kind = "scalar";
    state.result = "";
    state.position++;
    captureStart = captureEnd = state.position;
    while ((ch = state.input.charCodeAt(state.position)) !== 0) {
      if (ch === 34) {
        captureSegment(state, captureStart, state.position, true);
        state.position++;
        return true;
      } else if (ch === 92) {
        captureSegment(state, captureStart, state.position, true);
        ch = state.input.charCodeAt(++state.position);
        if (isEol(ch)) {
          skipSeparationSpace(state, false, nodeIndent);
        } else if (ch < 256 && simpleEscapeCheck[ch]) {
          state.result += simpleEscapeMap[ch];
          state.position++;
        } else if ((tmp = escapedHexLen(ch)) > 0) {
          let hexLength = tmp;
          let hexResult = 0;
          for (; hexLength > 0; hexLength--) {
            ch = state.input.charCodeAt(++state.position);
            if ((tmp = fromHexCode(ch)) >= 0) {
              hexResult = (hexResult << 4) + tmp;
            } else {
              throwError(state, "expected hexadecimal character");
            }
          }
          state.result += charFromCodepoint(hexResult);
          state.position++;
        } else {
          throwError(state, "unknown escape sequence");
        }
        captureStart = captureEnd = state.position;
      } else if (isEol(ch)) {
        captureSegment(state, captureStart, captureEnd, true);
        writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
        captureStart = captureEnd = state.position;
      } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
        throwError(state, "unexpected end of the document within a double quoted scalar");
      } else {
        state.position++;
        if (!isWhiteSpace(ch)) {
          captureEnd = state.position;
        }
      }
    }
    throwError(state, "unexpected end of the stream within a double quoted scalar");
  }
  function readFlowCollection(state, nodeIndent) {
    let readNext = true;
    let _line;
    let _lineStart;
    let _pos;
    const _tag = state.tag;
    let _result;
    const _anchor = state.anchor;
    let terminator;
    let isPair;
    let isExplicitPair;
    let isMapping;
    const overridableKeys = /* @__PURE__ */ Object.create(null);
    let keyNode;
    let keyTag;
    let valueNode;
    let ch = state.input.charCodeAt(state.position);
    if (ch === 91) {
      terminator = 93;
      isMapping = false;
      _result = [];
    } else if (ch === 123) {
      terminator = 125;
      isMapping = true;
      _result = {};
    } else {
      return false;
    }
    if (state.anchor !== null) {
      storeAnchor(state, state.anchor, _result);
    }
    ch = state.input.charCodeAt(++state.position);
    while (ch !== 0) {
      skipSeparationSpace(state, true, nodeIndent);
      ch = state.input.charCodeAt(state.position);
      if (ch === terminator) {
        state.position++;
        state.tag = _tag;
        state.anchor = _anchor;
        state.kind = isMapping ? "mapping" : "sequence";
        state.result = _result;
        return true;
      } else if (!readNext) {
        throwError(state, "missed comma between flow collection entries");
      } else if (ch === 44) {
        throwError(state, "expected the node content, but found ','");
      }
      keyTag = keyNode = valueNode = null;
      isPair = isExplicitPair = false;
      if (ch === 63) {
        const following = state.input.charCodeAt(state.position + 1);
        if (isWsOrEol(following)) {
          isPair = isExplicitPair = true;
          state.position++;
          skipSeparationSpace(state, true, nodeIndent);
        }
      }
      _line = state.line;
      _lineStart = state.lineStart;
      _pos = state.position;
      composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
      keyTag = state.tag;
      keyNode = state.result;
      skipSeparationSpace(state, true, nodeIndent);
      ch = state.input.charCodeAt(state.position);
      if ((isExplicitPair || state.line === _line) && ch === 58) {
        isPair = true;
        ch = state.input.charCodeAt(++state.position);
        skipSeparationSpace(state, true, nodeIndent);
        composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
        valueNode = state.result;
      }
      if (isMapping) {
        storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, _line, _lineStart, _pos);
      } else if (isPair) {
        _result.push(storeMappingPair(state, null, overridableKeys, keyTag, keyNode, valueNode, _line, _lineStart, _pos));
      } else {
        _result.push(keyNode);
      }
      skipSeparationSpace(state, true, nodeIndent);
      ch = state.input.charCodeAt(state.position);
      if (ch === 44) {
        readNext = true;
        ch = state.input.charCodeAt(++state.position);
      } else {
        readNext = false;
      }
    }
    throwError(state, "unexpected end of the stream within a flow collection");
  }
  function readBlockScalar(state, nodeIndent) {
    let folding;
    let chomping = CHOMPING_CLIP;
    let didReadContent = false;
    let detectedIndent = false;
    let textIndent = nodeIndent;
    let emptyLines = 0;
    let atMoreIndented = false;
    let tmp;
    let ch = state.input.charCodeAt(state.position);
    if (ch === 124) {
      folding = false;
    } else if (ch === 62) {
      folding = true;
    } else {
      return false;
    }
    state.kind = "scalar";
    state.result = "";
    while (ch !== 0) {
      ch = state.input.charCodeAt(++state.position);
      if (ch === 43 || ch === 45) {
        if (CHOMPING_CLIP === chomping) {
          chomping = ch === 43 ? CHOMPING_KEEP : CHOMPING_STRIP;
        } else {
          throwError(state, "repeat of a chomping mode identifier");
        }
      } else if ((tmp = fromDecimalCode(ch)) >= 0) {
        if (tmp === 0) {
          throwError(state, "bad explicit indentation width of a block scalar; it cannot be less than one");
        } else if (!detectedIndent) {
          textIndent = nodeIndent + tmp - 1;
          detectedIndent = true;
        } else {
          throwError(state, "repeat of an indentation width identifier");
        }
      } else {
        break;
      }
    }
    if (isWhiteSpace(ch)) {
      do {
        ch = state.input.charCodeAt(++state.position);
      } while (isWhiteSpace(ch));
      if (ch === 35) {
        do {
          ch = state.input.charCodeAt(++state.position);
        } while (!isEol(ch) && ch !== 0);
      }
    }
    while (ch !== 0) {
      readLineBreak(state);
      state.lineIndent = 0;
      ch = state.input.charCodeAt(state.position);
      while ((!detectedIndent || state.lineIndent < textIndent) && ch === 32) {
        state.lineIndent++;
        ch = state.input.charCodeAt(++state.position);
      }
      if (!detectedIndent && state.lineIndent > textIndent) {
        textIndent = state.lineIndent;
      }
      if (isEol(ch)) {
        emptyLines++;
        continue;
      }
      if (!detectedIndent && textIndent === 0) {
        throwError(state, "missing indentation for block scalar");
      }
      if (state.lineIndent < textIndent) {
        if (chomping === CHOMPING_KEEP) {
          state.result += common2.repeat("\n", didReadContent ? 1 + emptyLines : emptyLines);
        } else if (chomping === CHOMPING_CLIP) {
          if (didReadContent) {
            state.result += "\n";
          }
        }
        break;
      }
      if (folding) {
        if (isWhiteSpace(ch)) {
          atMoreIndented = true;
          state.result += common2.repeat("\n", didReadContent ? 1 + emptyLines : emptyLines);
        } else if (atMoreIndented) {
          atMoreIndented = false;
          state.result += common2.repeat("\n", emptyLines + 1);
        } else if (emptyLines === 0) {
          if (didReadContent) {
            state.result += " ";
          }
        } else {
          state.result += common2.repeat("\n", emptyLines);
        }
      } else {
        state.result += common2.repeat("\n", didReadContent ? 1 + emptyLines : emptyLines);
      }
      didReadContent = true;
      detectedIndent = true;
      emptyLines = 0;
      const captureStart = state.position;
      while (!isEol(ch) && ch !== 0) {
        ch = state.input.charCodeAt(++state.position);
      }
      captureSegment(state, captureStart, state.position, false);
    }
    return true;
  }
  function readBlockSequence(state, nodeIndent) {
    const _tag = state.tag;
    const _anchor = state.anchor;
    const _result = [];
    let detected = false;
    if (state.firstTabInLine !== -1) return false;
    if (state.anchor !== null) {
      storeAnchor(state, state.anchor, _result);
    }
    let ch = state.input.charCodeAt(state.position);
    while (ch !== 0) {
      if (state.firstTabInLine !== -1) {
        state.position = state.firstTabInLine;
        throwError(state, "tab characters must not be used in indentation");
      }
      if (ch !== 45) {
        break;
      }
      const following = state.input.charCodeAt(state.position + 1);
      if (!isWsOrEol(following)) {
        break;
      }
      detected = true;
      state.position++;
      if (skipSeparationSpace(state, true, -1)) {
        if (state.lineIndent <= nodeIndent) {
          _result.push(null);
          ch = state.input.charCodeAt(state.position);
          continue;
        }
      }
      const _line = state.line;
      composeNode(state, nodeIndent, CONTEXT_BLOCK_IN, false, true);
      _result.push(state.result);
      skipSeparationSpace(state, true, -1);
      ch = state.input.charCodeAt(state.position);
      if ((state.line === _line || state.lineIndent > nodeIndent) && ch !== 0) {
        throwError(state, "bad indentation of a sequence entry");
      } else if (state.lineIndent < nodeIndent) {
        break;
      }
    }
    if (detected) {
      state.tag = _tag;
      state.anchor = _anchor;
      state.kind = "sequence";
      state.result = _result;
      return true;
    }
    return false;
  }
  function readBlockMapping(state, nodeIndent, flowIndent) {
    let allowCompact;
    let _keyLine;
    let _keyLineStart;
    let _keyPos;
    const _tag = state.tag;
    const _anchor = state.anchor;
    const _result = {};
    const overridableKeys = /* @__PURE__ */ Object.create(null);
    let keyTag = null;
    let keyNode = null;
    let valueNode = null;
    let atExplicitKey = false;
    let detected = false;
    if (state.firstTabInLine !== -1) return false;
    if (state.anchor !== null) {
      storeAnchor(state, state.anchor, _result);
    }
    let ch = state.input.charCodeAt(state.position);
    while (ch !== 0) {
      if (!atExplicitKey && state.firstTabInLine !== -1) {
        state.position = state.firstTabInLine;
        throwError(state, "tab characters must not be used in indentation");
      }
      const following = state.input.charCodeAt(state.position + 1);
      const _line = state.line;
      if ((ch === 63 || ch === 58) && isWsOrEol(following)) {
        if (ch === 63) {
          if (atExplicitKey) {
            storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
            keyTag = keyNode = valueNode = null;
          }
          detected = true;
          atExplicitKey = true;
          allowCompact = true;
        } else if (atExplicitKey) {
          atExplicitKey = false;
          allowCompact = true;
        } else {
          throwError(state, "incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line");
        }
        state.position += 1;
        ch = following;
      } else {
        _keyLine = state.line;
        _keyLineStart = state.lineStart;
        _keyPos = state.position;
        if (!composeNode(state, flowIndent, CONTEXT_FLOW_OUT, false, true)) {
          break;
        }
        if (state.line === _line) {
          ch = state.input.charCodeAt(state.position);
          while (isWhiteSpace(ch)) {
            ch = state.input.charCodeAt(++state.position);
          }
          if (ch === 58) {
            ch = state.input.charCodeAt(++state.position);
            if (!isWsOrEol(ch)) {
              throwError(state, "a whitespace character is expected after the key-value separator within a block mapping");
            }
            if (atExplicitKey) {
              storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
              keyTag = keyNode = valueNode = null;
            }
            detected = true;
            atExplicitKey = false;
            allowCompact = false;
            keyTag = state.tag;
            keyNode = state.result;
          } else if (detected) {
            throwError(state, "can not read an implicit mapping pair; a colon is missed");
          } else {
            state.tag = _tag;
            state.anchor = _anchor;
            return true;
          }
        } else if (detected) {
          throwError(state, "can not read a block mapping entry; a multiline key may not be an implicit key");
        } else {
          state.tag = _tag;
          state.anchor = _anchor;
          return true;
        }
      }
      if (state.line === _line || state.lineIndent > nodeIndent) {
        if (atExplicitKey) {
          _keyLine = state.line;
          _keyLineStart = state.lineStart;
          _keyPos = state.position;
        }
        if (composeNode(state, nodeIndent, CONTEXT_BLOCK_OUT, true, allowCompact)) {
          if (atExplicitKey) {
            keyNode = state.result;
          } else {
            valueNode = state.result;
          }
        }
        if (!atExplicitKey) {
          storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, _keyLine, _keyLineStart, _keyPos);
          keyTag = keyNode = valueNode = null;
        }
        skipSeparationSpace(state, true, -1);
        ch = state.input.charCodeAt(state.position);
      }
      if ((state.line === _line || state.lineIndent > nodeIndent) && ch !== 0) {
        throwError(state, "bad indentation of a mapping entry");
      } else if (state.lineIndent < nodeIndent) {
        break;
      }
    }
    if (atExplicitKey) {
      storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
    }
    if (detected) {
      state.tag = _tag;
      state.anchor = _anchor;
      state.kind = "mapping";
      state.result = _result;
    }
    return detected;
  }
  function readTagProperty(state) {
    let isVerbatim = false;
    let isNamed = false;
    let tagHandle;
    let tagName;
    let ch = state.input.charCodeAt(state.position);
    if (ch !== 33) return false;
    if (state.tag !== null) {
      throwError(state, "duplication of a tag property");
    }
    ch = state.input.charCodeAt(++state.position);
    if (ch === 60) {
      isVerbatim = true;
      ch = state.input.charCodeAt(++state.position);
    } else if (ch === 33) {
      isNamed = true;
      tagHandle = "!!";
      ch = state.input.charCodeAt(++state.position);
    } else {
      tagHandle = "!";
    }
    let _position = state.position;
    if (isVerbatim) {
      do {
        ch = state.input.charCodeAt(++state.position);
      } while (ch !== 0 && ch !== 62);
      if (state.position < state.length) {
        tagName = state.input.slice(_position, state.position);
        ch = state.input.charCodeAt(++state.position);
      } else {
        throwError(state, "unexpected end of the stream within a verbatim tag");
      }
    } else {
      while (ch !== 0 && !isWsOrEol(ch)) {
        if (ch === 33) {
          if (!isNamed) {
            tagHandle = state.input.slice(_position - 1, state.position + 1);
            if (!PATTERN_TAG_HANDLE.test(tagHandle)) {
              throwError(state, "named tag handle cannot contain such characters");
            }
            isNamed = true;
            _position = state.position + 1;
          } else {
            throwError(state, "tag suffix cannot contain exclamation marks");
          }
        }
        ch = state.input.charCodeAt(++state.position);
      }
      tagName = state.input.slice(_position, state.position);
      if (PATTERN_FLOW_INDICATORS.test(tagName)) {
        throwError(state, "tag suffix cannot contain flow indicator characters");
      }
    }
    if (tagName && !PATTERN_TAG_URI.test(tagName)) {
      throwError(state, "tag name cannot contain such characters: " + tagName);
    }
    try {
      tagName = decodeURIComponent(tagName);
    } catch (err) {
      throwError(state, "tag name is malformed: " + tagName);
    }
    if (isVerbatim) {
      state.tag = tagName;
    } else if (_hasOwnProperty.call(state.tagMap, tagHandle)) {
      state.tag = state.tagMap[tagHandle] + tagName;
    } else if (tagHandle === "!") {
      state.tag = "!" + tagName;
    } else if (tagHandle === "!!") {
      state.tag = "tag:yaml.org,2002:" + tagName;
    } else {
      throwError(state, 'undeclared tag handle "' + tagHandle + '"');
    }
    return true;
  }
  function readAnchorProperty(state) {
    let ch = state.input.charCodeAt(state.position);
    if (ch !== 38) return false;
    if (state.anchor !== null) {
      throwError(state, "duplication of an anchor property");
    }
    ch = state.input.charCodeAt(++state.position);
    const _position = state.position;
    while (ch !== 0 && !isWsOrEol(ch) && !isFlowIndicator(ch)) {
      ch = state.input.charCodeAt(++state.position);
    }
    if (state.position === _position) {
      throwError(state, "name of an anchor node must contain at least one character");
    }
    state.anchor = state.input.slice(_position, state.position);
    return true;
  }
  function readAlias(state) {
    let ch = state.input.charCodeAt(state.position);
    if (ch !== 42) return false;
    ch = state.input.charCodeAt(++state.position);
    const _position = state.position;
    while (ch !== 0 && !isWsOrEol(ch) && !isFlowIndicator(ch)) {
      ch = state.input.charCodeAt(++state.position);
    }
    if (state.position === _position) {
      throwError(state, "name of an alias node must contain at least one character");
    }
    const alias = state.input.slice(_position, state.position);
    if (!_hasOwnProperty.call(state.anchorMap, alias)) {
      throwError(state, 'unidentified alias "' + alias + '"');
    }
    state.result = state.anchorMap[alias];
    skipSeparationSpace(state, true, -1);
    return true;
  }
  function tryReadBlockMappingFromProperty(state, propertyStart, nodeIndent, flowIndent) {
    const fallbackState = snapshotState(state);
    beginAnchorTransaction(state);
    restoreState(state, propertyStart);
    state.tag = null;
    state.anchor = null;
    state.kind = null;
    state.result = null;
    if (readBlockMapping(state, nodeIndent, flowIndent) && state.kind === "mapping") {
      commitAnchorTransaction(state);
      return true;
    }
    rollbackAnchorTransaction(state);
    restoreState(state, fallbackState);
    return false;
  }
  function composeNode(state, parentIndent, nodeContext, allowToSeek, allowCompact) {
    let allowBlockScalars;
    let allowBlockCollections;
    let indentStatus = 1;
    let atNewLine = false;
    let hasContent = false;
    let propertyStart = null;
    let type2;
    let flowIndent;
    let blockIndent;
    if (state.depth >= state.maxDepth) {
      throwError(state, "nesting exceeded maxDepth (" + state.maxDepth + ")");
    }
    state.depth += 1;
    if (state.listener !== null) {
      state.listener("open", state);
    }
    state.tag = null;
    state.anchor = null;
    state.kind = null;
    state.result = null;
    const allowBlockStyles = allowBlockScalars = allowBlockCollections = CONTEXT_BLOCK_OUT === nodeContext || CONTEXT_BLOCK_IN === nodeContext;
    if (allowToSeek) {
      if (skipSeparationSpace(state, true, -1)) {
        atNewLine = true;
        if (state.lineIndent > parentIndent) {
          indentStatus = 1;
        } else if (state.lineIndent === parentIndent) {
          indentStatus = 0;
        } else if (state.lineIndent < parentIndent) {
          indentStatus = -1;
        }
      }
    }
    if (indentStatus === 1) {
      while (true) {
        const ch = state.input.charCodeAt(state.position);
        const propertyState = snapshotState(state);
        if (atNewLine && (ch === 33 && state.tag !== null || ch === 38 && state.anchor !== null)) {
          break;
        }
        if (!readTagProperty(state) && !readAnchorProperty(state)) {
          break;
        }
        if (propertyStart === null) {
          propertyStart = propertyState;
        }
        if (skipSeparationSpace(state, true, -1)) {
          atNewLine = true;
          allowBlockCollections = allowBlockStyles;
          if (state.lineIndent > parentIndent) {
            indentStatus = 1;
          } else if (state.lineIndent === parentIndent) {
            indentStatus = 0;
          } else if (state.lineIndent < parentIndent) {
            indentStatus = -1;
          }
        } else {
          allowBlockCollections = false;
        }
      }
    }
    if (allowBlockCollections) {
      allowBlockCollections = atNewLine || allowCompact;
    }
    if (indentStatus === 1 || CONTEXT_BLOCK_OUT === nodeContext) {
      if (CONTEXT_FLOW_IN === nodeContext || CONTEXT_FLOW_OUT === nodeContext) {
        flowIndent = parentIndent;
      } else {
        flowIndent = parentIndent + 1;
      }
      blockIndent = state.position - state.lineStart;
      if (indentStatus === 1) {
        if (allowBlockCollections && (readBlockSequence(state, blockIndent) || readBlockMapping(state, blockIndent, flowIndent)) || readFlowCollection(state, flowIndent)) {
          hasContent = true;
        } else {
          const ch = state.input.charCodeAt(state.position);
          if (propertyStart !== null && allowBlockStyles && !allowBlockCollections && ch !== 124 && ch !== 62 && tryReadBlockMappingFromProperty(
            state,
            propertyStart,
            propertyStart.position - propertyStart.lineStart,
            flowIndent
          )) {
            hasContent = true;
          } else if (allowBlockScalars && readBlockScalar(state, flowIndent) || readSingleQuotedScalar(state, flowIndent) || readDoubleQuotedScalar(state, flowIndent)) {
            hasContent = true;
          } else if (readAlias(state)) {
            hasContent = true;
            if (state.tag !== null || state.anchor !== null) {
              throwError(state, "alias node should not have any properties");
            }
          } else if (readPlainScalar(state, flowIndent, CONTEXT_FLOW_IN === nodeContext)) {
            hasContent = true;
            if (state.tag === null) {
              state.tag = "?";
            }
          }
          if (state.anchor !== null) {
            storeAnchor(state, state.anchor, state.result);
          }
        }
      } else if (indentStatus === 0) {
        hasContent = allowBlockCollections && readBlockSequence(state, blockIndent);
      }
    }
    if (state.tag === null) {
      if (state.anchor !== null) {
        storeAnchor(state, state.anchor, state.result);
      }
    } else if (state.tag === "?") {
      if (state.result !== null && state.kind !== "scalar") {
        throwError(state, 'unacceptable node kind for !<?> tag; it should be "scalar", not "' + state.kind + '"');
      }
      for (let typeIndex = 0, typeQuantity = state.implicitTypes.length; typeIndex < typeQuantity; typeIndex += 1) {
        type2 = state.implicitTypes[typeIndex];
        if (type2.resolve(state.result)) {
          state.result = type2.construct(state.result);
          state.tag = type2.tag;
          if (state.anchor !== null) {
            storeAnchor(state, state.anchor, state.result);
          }
          break;
        }
      }
    } else if (state.tag !== "!") {
      if (_hasOwnProperty.call(state.typeMap[state.kind || "fallback"], state.tag)) {
        type2 = state.typeMap[state.kind || "fallback"][state.tag];
      } else {
        type2 = null;
        const typeList = state.typeMap.multi[state.kind || "fallback"];
        for (let typeIndex = 0, typeQuantity = typeList.length; typeIndex < typeQuantity; typeIndex += 1) {
          if (state.tag.slice(0, typeList[typeIndex].tag.length) === typeList[typeIndex].tag) {
            type2 = typeList[typeIndex];
            break;
          }
        }
      }
      if (!type2) {
        throwError(state, "unknown tag !<" + state.tag + ">");
      }
      if (state.result !== null && type2.kind !== state.kind) {
        throwError(state, "unacceptable node kind for !<" + state.tag + '> tag; it should be "' + type2.kind + '", not "' + state.kind + '"');
      }
      if (!type2.resolve(state.result, state.tag)) {
        throwError(state, "cannot resolve a node with !<" + state.tag + "> explicit tag");
      } else {
        state.result = type2.construct(state.result, state.tag);
        if (state.anchor !== null) {
          storeAnchor(state, state.anchor, state.result);
        }
      }
    }
    if (state.listener !== null) {
      state.listener("close", state);
    }
    state.depth -= 1;
    return state.tag !== null || state.anchor !== null || hasContent;
  }
  function readDocument(state) {
    const documentStart = state.position;
    let hasDirectives = false;
    let ch;
    state.version = null;
    state.checkLineBreaks = state.legacy;
    state.tagMap = /* @__PURE__ */ Object.create(null);
    state.anchorMap = /* @__PURE__ */ Object.create(null);
    while ((ch = state.input.charCodeAt(state.position)) !== 0) {
      skipSeparationSpace(state, true, -1);
      ch = state.input.charCodeAt(state.position);
      if (state.lineIndent > 0 || ch !== 37) {
        break;
      }
      hasDirectives = true;
      ch = state.input.charCodeAt(++state.position);
      let _position = state.position;
      while (ch !== 0 && !isWsOrEol(ch)) {
        ch = state.input.charCodeAt(++state.position);
      }
      const directiveName = state.input.slice(_position, state.position);
      const directiveArgs = [];
      if (directiveName.length < 1) {
        throwError(state, "directive name must not be less than one character in length");
      }
      while (ch !== 0) {
        while (isWhiteSpace(ch)) {
          ch = state.input.charCodeAt(++state.position);
        }
        if (ch === 35) {
          do {
            ch = state.input.charCodeAt(++state.position);
          } while (ch !== 0 && !isEol(ch));
          break;
        }
        if (isEol(ch)) break;
        _position = state.position;
        while (ch !== 0 && !isWsOrEol(ch)) {
          ch = state.input.charCodeAt(++state.position);
        }
        directiveArgs.push(state.input.slice(_position, state.position));
      }
      if (ch !== 0) readLineBreak(state);
      if (_hasOwnProperty.call(directiveHandlers, directiveName)) {
        directiveHandlers[directiveName](state, directiveName, directiveArgs);
      } else {
        throwWarning(state, 'unknown document directive "' + directiveName + '"');
      }
    }
    skipSeparationSpace(state, true, -1);
    if (state.lineIndent === 0 && state.input.charCodeAt(state.position) === 45 && state.input.charCodeAt(state.position + 1) === 45 && state.input.charCodeAt(state.position + 2) === 45) {
      state.position += 3;
      skipSeparationSpace(state, true, -1);
    } else if (hasDirectives) {
      throwError(state, "directives end mark is expected");
    }
    composeNode(state, state.lineIndent - 1, CONTEXT_BLOCK_OUT, false, true);
    skipSeparationSpace(state, true, -1);
    if (state.checkLineBreaks && PATTERN_NON_ASCII_LINE_BREAKS.test(state.input.slice(documentStart, state.position))) {
      throwWarning(state, "non-ASCII line breaks are interpreted as content");
    }
    state.documents.push(state.result);
    if (state.position === state.lineStart && testDocumentSeparator(state)) {
      if (state.input.charCodeAt(state.position) === 46) {
        state.position += 3;
        skipSeparationSpace(state, true, -1);
      }
      return;
    }
    if (state.position < state.length - 1) {
      throwError(state, "end of the stream or a document separator is expected");
    }
  }
  function loadDocuments(input, options2) {
    input = String(input);
    options2 = options2 || {};
    if (input.length !== 0) {
      if (input.charCodeAt(input.length - 1) !== 10 && input.charCodeAt(input.length - 1) !== 13) {
        input += "\n";
      }
      if (input.charCodeAt(0) === 65279) {
        input = input.slice(1);
      }
    }
    const state = new State(input, options2);
    const nullpos = input.indexOf("\0");
    if (nullpos !== -1) {
      state.position = nullpos;
      throwError(state, "null byte is not allowed in input");
    }
    state.input += "\0";
    while (state.input.charCodeAt(state.position) === 32) {
      state.lineIndent += 1;
      state.position += 1;
    }
    while (state.position < state.length - 1) {
      readDocument(state);
    }
    return state.documents;
  }
  function loadAll2(input, iterator, options2) {
    if (iterator !== null && typeof iterator === "object" && typeof options2 === "undefined") {
      options2 = iterator;
      iterator = null;
    }
    const documents = loadDocuments(input, options2);
    if (typeof iterator !== "function") {
      return documents;
    }
    for (let index = 0, length = documents.length; index < length; index += 1) {
      iterator(documents[index]);
    }
  }
  function load2(input, options2) {
    const documents = loadDocuments(input, options2);
    if (documents.length === 0) {
      return void 0;
    } else if (documents.length === 1) {
      return documents[0];
    }
    throw new YAMLException2("expected a single document in the stream, but found more");
  }
  loader.loadAll = loadAll2;
  loader.load = load2;
  return loader;
}
var dumper = {};
var hasRequiredDumper;
function requireDumper() {
  if (hasRequiredDumper) return dumper;
  hasRequiredDumper = 1;
  const common2 = requireCommon();
  const YAMLException2 = requireException();
  const DEFAULT_SCHEMA2 = require_default();
  const _toString = Object.prototype.toString;
  const _hasOwnProperty = Object.prototype.hasOwnProperty;
  const CHAR_BOM = 65279;
  const CHAR_TAB = 9;
  const CHAR_LINE_FEED = 10;
  const CHAR_CARRIAGE_RETURN = 13;
  const CHAR_SPACE = 32;
  const CHAR_EXCLAMATION = 33;
  const CHAR_DOUBLE_QUOTE = 34;
  const CHAR_SHARP = 35;
  const CHAR_PERCENT = 37;
  const CHAR_AMPERSAND = 38;
  const CHAR_SINGLE_QUOTE = 39;
  const CHAR_ASTERISK = 42;
  const CHAR_COMMA = 44;
  const CHAR_MINUS = 45;
  const CHAR_COLON = 58;
  const CHAR_EQUALS = 61;
  const CHAR_GREATER_THAN = 62;
  const CHAR_QUESTION = 63;
  const CHAR_COMMERCIAL_AT = 64;
  const CHAR_LEFT_SQUARE_BRACKET = 91;
  const CHAR_RIGHT_SQUARE_BRACKET = 93;
  const CHAR_GRAVE_ACCENT = 96;
  const CHAR_LEFT_CURLY_BRACKET = 123;
  const CHAR_VERTICAL_LINE = 124;
  const CHAR_RIGHT_CURLY_BRACKET = 125;
  const ESCAPE_SEQUENCES = {};
  ESCAPE_SEQUENCES[0] = "\\0";
  ESCAPE_SEQUENCES[7] = "\\a";
  ESCAPE_SEQUENCES[8] = "\\b";
  ESCAPE_SEQUENCES[9] = "\\t";
  ESCAPE_SEQUENCES[10] = "\\n";
  ESCAPE_SEQUENCES[11] = "\\v";
  ESCAPE_SEQUENCES[12] = "\\f";
  ESCAPE_SEQUENCES[13] = "\\r";
  ESCAPE_SEQUENCES[27] = "\\e";
  ESCAPE_SEQUENCES[34] = '\\"';
  ESCAPE_SEQUENCES[92] = "\\\\";
  ESCAPE_SEQUENCES[133] = "\\N";
  ESCAPE_SEQUENCES[160] = "\\_";
  ESCAPE_SEQUENCES[8232] = "\\L";
  ESCAPE_SEQUENCES[8233] = "\\P";
  const DEPRECATED_BOOLEANS_SYNTAX = [
    "y",
    "Y",
    "yes",
    "Yes",
    "YES",
    "on",
    "On",
    "ON",
    "n",
    "N",
    "no",
    "No",
    "NO",
    "off",
    "Off",
    "OFF"
  ];
  const DEPRECATED_BASE60_SYNTAX = /^[-+]?[0-9_]+(?::[0-9_]+)+(?:\.[0-9_]*)?$/;
  function compileStyleMap(schema2, map2) {
    if (map2 === null) return {};
    const result = {};
    const keys = Object.keys(map2);
    for (let index = 0, length = keys.length; index < length; index += 1) {
      let tag = keys[index];
      let style = String(map2[tag]);
      if (tag.slice(0, 2) === "!!") {
        tag = "tag:yaml.org,2002:" + tag.slice(2);
      }
      const type2 = schema2.compiledTypeMap["fallback"][tag];
      if (type2 && _hasOwnProperty.call(type2.styleAliases, style)) {
        style = type2.styleAliases[style];
      }
      result[tag] = style;
    }
    return result;
  }
  function encodeHex(character) {
    let handle;
    let length;
    const string = character.toString(16).toUpperCase();
    if (character <= 255) {
      handle = "x";
      length = 2;
    } else if (character <= 65535) {
      handle = "u";
      length = 4;
    } else if (character <= 4294967295) {
      handle = "U";
      length = 8;
    } else {
      throw new YAMLException2("code point within a string may not be greater than 0xFFFFFFFF");
    }
    return "\\" + handle + common2.repeat("0", length - string.length) + string;
  }
  const QUOTING_TYPE_SINGLE = 1;
  const QUOTING_TYPE_DOUBLE = 2;
  function State(options2) {
    this.schema = options2["schema"] || DEFAULT_SCHEMA2;
    this.indent = Math.max(1, options2["indent"] || 2);
    this.noArrayIndent = options2["noArrayIndent"] || false;
    this.skipInvalid = options2["skipInvalid"] || false;
    this.flowLevel = common2.isNothing(options2["flowLevel"]) ? -1 : options2["flowLevel"];
    this.styleMap = compileStyleMap(this.schema, options2["styles"] || null);
    this.sortKeys = options2["sortKeys"] || false;
    this.lineWidth = options2["lineWidth"] || 80;
    this.noRefs = options2["noRefs"] || false;
    this.noCompatMode = options2["noCompatMode"] || false;
    this.condenseFlow = options2["condenseFlow"] || false;
    this.quotingType = options2["quotingType"] === '"' ? QUOTING_TYPE_DOUBLE : QUOTING_TYPE_SINGLE;
    this.forceQuotes = options2["forceQuotes"] || false;
    this.replacer = typeof options2["replacer"] === "function" ? options2["replacer"] : null;
    this.implicitTypes = this.schema.compiledImplicit;
    this.explicitTypes = this.schema.compiledExplicit;
    this.tag = null;
    this.result = "";
    this.duplicates = [];
    this.usedDuplicates = null;
  }
  function indentString(string, spaces) {
    const ind = common2.repeat(" ", spaces);
    let position = 0;
    let result = "";
    const length = string.length;
    while (position < length) {
      let line;
      const next = string.indexOf("\n", position);
      if (next === -1) {
        line = string.slice(position);
        position = length;
      } else {
        line = string.slice(position, next + 1);
        position = next + 1;
      }
      if (line.length && line !== "\n") result += ind;
      result += line;
    }
    return result;
  }
  function generateNextLine(state, level) {
    return "\n" + common2.repeat(" ", state.indent * level);
  }
  function testImplicitResolving(state, str2) {
    for (let index = 0, length = state.implicitTypes.length; index < length; index += 1) {
      const type2 = state.implicitTypes[index];
      if (type2.resolve(str2)) {
        return true;
      }
    }
    return false;
  }
  function isWhitespace(c) {
    return c === CHAR_SPACE || c === CHAR_TAB;
  }
  function isPrintable(c) {
    return c >= 32 && c <= 126 || c >= 161 && c <= 55295 && c !== 8232 && c !== 8233 || c >= 57344 && c <= 65533 && c !== CHAR_BOM || c >= 65536 && c <= 1114111;
  }
  function isNsCharOrWhitespace(c) {
    return isPrintable(c) && c !== CHAR_BOM && // - b-char
    c !== CHAR_CARRIAGE_RETURN && c !== CHAR_LINE_FEED;
  }
  function isPlainSafe(c, prev, inblock) {
    const cIsNsCharOrWhitespace = isNsCharOrWhitespace(c);
    const cIsNsChar = cIsNsCharOrWhitespace && !isWhitespace(c);
    return (
      // ns-plain-safe
      (inblock ? cIsNsCharOrWhitespace : cIsNsCharOrWhitespace && // - c-flow-indicator
      c !== CHAR_COMMA && c !== CHAR_LEFT_SQUARE_BRACKET && c !== CHAR_RIGHT_SQUARE_BRACKET && c !== CHAR_LEFT_CURLY_BRACKET && c !== CHAR_RIGHT_CURLY_BRACKET) && // ns-plain-char
      c !== CHAR_SHARP && // false on '#'
      !(prev === CHAR_COLON && !cIsNsChar) || // false on ': '
      isNsCharOrWhitespace(prev) && !isWhitespace(prev) && c === CHAR_SHARP || // change to true on '[^ ]#'
      prev === CHAR_COLON && cIsNsChar
    );
  }
  function isPlainSafeFirst(c) {
    return isPrintable(c) && c !== CHAR_BOM && !isWhitespace(c) && // - s-white
    // - (c-indicator ::=
    // “-” | “?” | “:” | “,” | “[” | “]” | “{” | “}”
    c !== CHAR_MINUS && c !== CHAR_QUESTION && c !== CHAR_COLON && c !== CHAR_COMMA && c !== CHAR_LEFT_SQUARE_BRACKET && c !== CHAR_RIGHT_SQUARE_BRACKET && c !== CHAR_LEFT_CURLY_BRACKET && c !== CHAR_RIGHT_CURLY_BRACKET && // | “#” | “&” | “*” | “!” | “|” | “=” | “>” | “'” | “"”
    c !== CHAR_SHARP && c !== CHAR_AMPERSAND && c !== CHAR_ASTERISK && c !== CHAR_EXCLAMATION && c !== CHAR_VERTICAL_LINE && c !== CHAR_EQUALS && c !== CHAR_GREATER_THAN && c !== CHAR_SINGLE_QUOTE && c !== CHAR_DOUBLE_QUOTE && // | “%” | “@” | “`”)
    c !== CHAR_PERCENT && c !== CHAR_COMMERCIAL_AT && c !== CHAR_GRAVE_ACCENT;
  }
  function isPlainSafeLast(c) {
    return !isWhitespace(c) && c !== CHAR_COLON;
  }
  function codePointAt(string, pos) {
    const first = string.charCodeAt(pos);
    let second;
    if (first >= 55296 && first <= 56319 && pos + 1 < string.length) {
      second = string.charCodeAt(pos + 1);
      if (second >= 56320 && second <= 57343) {
        return (first - 55296) * 1024 + second - 56320 + 65536;
      }
    }
    return first;
  }
  function needIndentIndicator(string) {
    const leadingSpaceRe = /^\n* /;
    return leadingSpaceRe.test(string);
  }
  const STYLE_PLAIN = 1;
  const STYLE_SINGLE = 2;
  const STYLE_LITERAL = 3;
  const STYLE_FOLDED = 4;
  const STYLE_DOUBLE = 5;
  function chooseScalarStyle(string, singleLineOnly, indentPerLevel, lineWidth, testAmbiguousType, quotingType, forceQuotes, inblock) {
    let i;
    let char = 0;
    let prevChar = null;
    let hasLineBreak = false;
    let hasFoldableLine = false;
    const shouldTrackWidth = lineWidth !== -1;
    let previousLineBreak = -1;
    let plain = isPlainSafeFirst(codePointAt(string, 0)) && isPlainSafeLast(codePointAt(string, string.length - 1));
    if (singleLineOnly || forceQuotes) {
      for (i = 0; i < string.length; char >= 65536 ? i += 2 : i++) {
        char = codePointAt(string, i);
        if (!isPrintable(char)) {
          return STYLE_DOUBLE;
        }
        plain = plain && isPlainSafe(char, prevChar, inblock);
        prevChar = char;
      }
    } else {
      for (i = 0; i < string.length; char >= 65536 ? i += 2 : i++) {
        char = codePointAt(string, i);
        if (char === CHAR_LINE_FEED) {
          hasLineBreak = true;
          if (shouldTrackWidth) {
            hasFoldableLine = hasFoldableLine || // Foldable line = too long, and not more-indented.
            i - previousLineBreak - 1 > lineWidth && string[previousLineBreak + 1] !== " ";
            previousLineBreak = i;
          }
        } else if (!isPrintable(char)) {
          return STYLE_DOUBLE;
        }
        plain = plain && isPlainSafe(char, prevChar, inblock);
        prevChar = char;
      }
      hasFoldableLine = hasFoldableLine || shouldTrackWidth && (i - previousLineBreak - 1 > lineWidth && string[previousLineBreak + 1] !== " ");
    }
    if (!hasLineBreak && !hasFoldableLine) {
      if (plain && !forceQuotes && !testAmbiguousType(string)) {
        return STYLE_PLAIN;
      }
      return quotingType === QUOTING_TYPE_DOUBLE ? STYLE_DOUBLE : STYLE_SINGLE;
    }
    if (indentPerLevel > 9 && needIndentIndicator(string)) {
      return STYLE_DOUBLE;
    }
    if (!forceQuotes) {
      return hasFoldableLine ? STYLE_FOLDED : STYLE_LITERAL;
    }
    return quotingType === QUOTING_TYPE_DOUBLE ? STYLE_DOUBLE : STYLE_SINGLE;
  }
  function writeScalar(state, string, level, iskey, inblock) {
    state.dump = (function() {
      if (string.length === 0) {
        return state.quotingType === QUOTING_TYPE_DOUBLE ? '""' : "''";
      }
      if (!state.noCompatMode) {
        if (DEPRECATED_BOOLEANS_SYNTAX.indexOf(string) !== -1 || DEPRECATED_BASE60_SYNTAX.test(string)) {
          return state.quotingType === QUOTING_TYPE_DOUBLE ? '"' + string + '"' : "'" + string + "'";
        }
      }
      const indent = state.indent * Math.max(1, level);
      const lineWidth = state.lineWidth === -1 ? -1 : Math.max(Math.min(state.lineWidth, 40), state.lineWidth - indent);
      const singleLineOnly = iskey || // No block styles in flow mode.
      state.flowLevel > -1 && level >= state.flowLevel;
      function testAmbiguity(string2) {
        return testImplicitResolving(state, string2);
      }
      switch (chooseScalarStyle(
        string,
        singleLineOnly,
        state.indent,
        lineWidth,
        testAmbiguity,
        state.quotingType,
        state.forceQuotes && !iskey,
        inblock
      )) {
        case STYLE_PLAIN:
          return string;
        case STYLE_SINGLE:
          return "'" + string.replace(/'/g, "''") + "'";
        case STYLE_LITERAL:
          return "|" + blockHeader(string, state.indent) + dropEndingNewline(indentString(string, indent));
        case STYLE_FOLDED:
          return ">" + blockHeader(string, state.indent) + dropEndingNewline(indentString(foldString(string, lineWidth), indent));
        case STYLE_DOUBLE:
          return '"' + escapeString(string) + '"';
        default:
          throw new YAMLException2("impossible error: invalid scalar style");
      }
    })();
  }
  function blockHeader(string, indentPerLevel) {
    const indentIndicator = needIndentIndicator(string) ? String(indentPerLevel) : "";
    const clip = string[string.length - 1] === "\n";
    const keep = clip && (string[string.length - 2] === "\n" || string === "\n");
    const chomp = keep ? "+" : clip ? "" : "-";
    return indentIndicator + chomp + "\n";
  }
  function dropEndingNewline(string) {
    return string[string.length - 1] === "\n" ? string.slice(0, -1) : string;
  }
  function foldString(string, width) {
    const lineRe = /(\n+)([^\n]*)/g;
    let result = (function() {
      let nextLF = string.indexOf("\n");
      nextLF = nextLF !== -1 ? nextLF : string.length;
      lineRe.lastIndex = nextLF;
      return foldLine(string.slice(0, nextLF), width);
    })();
    let prevMoreIndented = string[0] === "\n" || string[0] === " ";
    let moreIndented;
    let match;
    while (match = lineRe.exec(string)) {
      const prefix = match[1];
      const line = match[2];
      moreIndented = line[0] === " ";
      result += prefix + (!prevMoreIndented && !moreIndented && line !== "" ? "\n" : "") + foldLine(line, width);
      prevMoreIndented = moreIndented;
    }
    return result;
  }
  function foldLine(line, width) {
    if (line === "" || line[0] === " ") return line;
    const breakRe = / [^ ]/g;
    let match;
    let start = 0;
    let end;
    let curr = 0;
    let next = 0;
    let result = "";
    while (match = breakRe.exec(line)) {
      next = match.index;
      if (next - start > width) {
        end = curr > start ? curr : next;
        result += "\n" + line.slice(start, end);
        start = end + 1;
      }
      curr = next;
    }
    result += "\n";
    if (line.length - start > width && curr > start) {
      result += line.slice(start, curr) + "\n" + line.slice(curr + 1);
    } else {
      result += line.slice(start);
    }
    return result.slice(1);
  }
  function escapeString(string) {
    let result = "";
    let char = 0;
    for (let i = 0; i < string.length; char >= 65536 ? i += 2 : i++) {
      char = codePointAt(string, i);
      const escapeSeq = ESCAPE_SEQUENCES[char];
      if (!escapeSeq && isPrintable(char)) {
        result += string[i];
        if (char >= 65536) result += string[i + 1];
      } else {
        result += escapeSeq || encodeHex(char);
      }
    }
    return result;
  }
  function writeFlowSequence(state, level, object) {
    let _result = "";
    const _tag = state.tag;
    for (let index = 0, length = object.length; index < length; index += 1) {
      let value = object[index];
      if (state.replacer) {
        value = state.replacer.call(object, String(index), value);
      }
      if (writeNode(state, level, value, false, false) || typeof value === "undefined" && writeNode(state, level, null, false, false)) {
        if (_result !== "") _result += "," + (!state.condenseFlow ? " " : "");
        _result += state.dump;
      }
    }
    state.tag = _tag;
    state.dump = "[" + _result + "]";
  }
  function writeBlockSequence(state, level, object, compact) {
    let _result = "";
    const _tag = state.tag;
    for (let index = 0, length = object.length; index < length; index += 1) {
      let value = object[index];
      if (state.replacer) {
        value = state.replacer.call(object, String(index), value);
      }
      if (writeNode(state, level + 1, value, true, true, false, true) || typeof value === "undefined" && writeNode(state, level + 1, null, true, true, false, true)) {
        if (!compact || _result !== "") {
          _result += generateNextLine(state, level);
        }
        if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
          _result += "-";
        } else {
          _result += "- ";
        }
        _result += state.dump;
      }
    }
    state.tag = _tag;
    state.dump = _result || "[]";
  }
  function writeFlowMapping(state, level, object) {
    let _result = "";
    const _tag = state.tag;
    const objectKeyList = Object.keys(object);
    for (let index = 0, length = objectKeyList.length; index < length; index += 1) {
      let pairBuffer = "";
      if (_result !== "") pairBuffer += ", ";
      if (state.condenseFlow) pairBuffer += '"';
      const objectKey = objectKeyList[index];
      let objectValue = object[objectKey];
      if (state.replacer) {
        objectValue = state.replacer.call(object, objectKey, objectValue);
      }
      if (!writeNode(state, level, objectKey, false, false)) {
        continue;
      }
      if (state.dump.length > 1024) pairBuffer += "? ";
      pairBuffer += state.dump + (state.condenseFlow ? '"' : "") + ":" + (state.condenseFlow ? "" : " ");
      if (!writeNode(state, level, objectValue, false, false)) {
        continue;
      }
      pairBuffer += state.dump;
      _result += pairBuffer;
    }
    state.tag = _tag;
    state.dump = "{" + _result + "}";
  }
  function writeBlockMapping(state, level, object, compact) {
    let _result = "";
    const _tag = state.tag;
    const objectKeyList = Object.keys(object);
    if (state.sortKeys === true) {
      objectKeyList.sort();
    } else if (typeof state.sortKeys === "function") {
      objectKeyList.sort(state.sortKeys);
    } else if (state.sortKeys) {
      throw new YAMLException2("sortKeys must be a boolean or a function");
    }
    for (let index = 0, length = objectKeyList.length; index < length; index += 1) {
      let pairBuffer = "";
      if (!compact || _result !== "") {
        pairBuffer += generateNextLine(state, level);
      }
      const objectKey = objectKeyList[index];
      let objectValue = object[objectKey];
      if (state.replacer) {
        objectValue = state.replacer.call(object, objectKey, objectValue);
      }
      if (!writeNode(state, level + 1, objectKey, true, true, true)) {
        continue;
      }
      const explicitPair = state.tag !== null && state.tag !== "?" || state.dump && state.dump.length > 1024;
      if (explicitPair) {
        if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
          pairBuffer += "?";
        } else {
          pairBuffer += "? ";
        }
      }
      pairBuffer += state.dump;
      if (explicitPair) {
        pairBuffer += generateNextLine(state, level);
      }
      if (!writeNode(state, level + 1, objectValue, true, explicitPair)) {
        continue;
      }
      if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
        pairBuffer += ":";
      } else {
        pairBuffer += ": ";
      }
      pairBuffer += state.dump;
      _result += pairBuffer;
    }
    state.tag = _tag;
    state.dump = _result || "{}";
  }
  function detectType(state, object, explicit) {
    const typeList = explicit ? state.explicitTypes : state.implicitTypes;
    for (let index = 0, length = typeList.length; index < length; index += 1) {
      const type2 = typeList[index];
      if ((type2.instanceOf || type2.predicate) && (!type2.instanceOf || typeof object === "object" && object instanceof type2.instanceOf) && (!type2.predicate || type2.predicate(object))) {
        if (explicit) {
          if (type2.multi && type2.representName) {
            state.tag = type2.representName(object);
          } else {
            state.tag = type2.tag;
          }
        } else {
          state.tag = "?";
        }
        if (type2.represent) {
          const style = state.styleMap[type2.tag] || type2.defaultStyle;
          let _result;
          if (_toString.call(type2.represent) === "[object Function]") {
            _result = type2.represent(object, style);
          } else if (_hasOwnProperty.call(type2.represent, style)) {
            _result = type2.represent[style](object, style);
          } else {
            throw new YAMLException2("!<" + type2.tag + '> tag resolver accepts not "' + style + '" style');
          }
          state.dump = _result;
        }
        return true;
      }
    }
    return false;
  }
  function writeNode(state, level, object, block, compact, iskey, isblockseq) {
    state.tag = null;
    state.dump = object;
    if (!detectType(state, object, false)) {
      detectType(state, object, true);
    }
    const type2 = _toString.call(state.dump);
    const inblock = block;
    if (block) {
      block = state.flowLevel < 0 || state.flowLevel > level;
    }
    const objectOrArray = type2 === "[object Object]" || type2 === "[object Array]";
    let duplicateIndex;
    let duplicate;
    if (objectOrArray) {
      duplicateIndex = state.duplicates.indexOf(object);
      duplicate = duplicateIndex !== -1;
    }
    if (state.tag !== null && state.tag !== "?" || duplicate || state.indent !== 2 && level > 0) {
      compact = false;
    }
    if (duplicate && state.usedDuplicates[duplicateIndex]) {
      state.dump = "*ref_" + duplicateIndex;
    } else {
      if (objectOrArray && duplicate && !state.usedDuplicates[duplicateIndex]) {
        state.usedDuplicates[duplicateIndex] = true;
      }
      if (type2 === "[object Object]") {
        if (block && Object.keys(state.dump).length !== 0) {
          writeBlockMapping(state, level, state.dump, compact);
          if (duplicate) {
            state.dump = "&ref_" + duplicateIndex + state.dump;
          }
        } else {
          writeFlowMapping(state, level, state.dump);
          if (duplicate) {
            state.dump = "&ref_" + duplicateIndex + " " + state.dump;
          }
        }
      } else if (type2 === "[object Array]") {
        if (block && state.dump.length !== 0) {
          if (state.noArrayIndent && !isblockseq && level > 0) {
            writeBlockSequence(state, level - 1, state.dump, compact);
          } else {
            writeBlockSequence(state, level, state.dump, compact);
          }
          if (duplicate) {
            state.dump = "&ref_" + duplicateIndex + state.dump;
          }
        } else {
          writeFlowSequence(state, level, state.dump);
          if (duplicate) {
            state.dump = "&ref_" + duplicateIndex + " " + state.dump;
          }
        }
      } else if (type2 === "[object String]") {
        if (state.tag !== "?") {
          writeScalar(state, state.dump, level, iskey, inblock);
        }
      } else if (type2 === "[object Undefined]") {
        return false;
      } else {
        if (state.skipInvalid) return false;
        throw new YAMLException2("unacceptable kind of an object to dump " + type2);
      }
      if (state.tag !== null && state.tag !== "?") {
        let tagStr = encodeURI(
          state.tag[0] === "!" ? state.tag.slice(1) : state.tag
        ).replace(/!/g, "%21");
        if (state.tag[0] === "!") {
          tagStr = "!" + tagStr;
        } else if (tagStr.slice(0, 18) === "tag:yaml.org,2002:") {
          tagStr = "!!" + tagStr.slice(18);
        } else {
          tagStr = "!<" + tagStr + ">";
        }
        state.dump = tagStr + " " + state.dump;
      }
    }
    return true;
  }
  function getDuplicateReferences(object, state) {
    const objects = [];
    const duplicatesIndexes = [];
    inspectNode(object, objects, duplicatesIndexes);
    const length = duplicatesIndexes.length;
    for (let index = 0; index < length; index += 1) {
      state.duplicates.push(objects[duplicatesIndexes[index]]);
    }
    state.usedDuplicates = new Array(length);
  }
  function inspectNode(object, objects, duplicatesIndexes) {
    if (object !== null && typeof object === "object") {
      const index = objects.indexOf(object);
      if (index !== -1) {
        if (duplicatesIndexes.indexOf(index) === -1) {
          duplicatesIndexes.push(index);
        }
      } else {
        objects.push(object);
        if (Array.isArray(object)) {
          for (let i = 0, length = object.length; i < length; i += 1) {
            inspectNode(object[i], objects, duplicatesIndexes);
          }
        } else {
          const objectKeyList = Object.keys(object);
          for (let i = 0, length = objectKeyList.length; i < length; i += 1) {
            inspectNode(object[objectKeyList[i]], objects, duplicatesIndexes);
          }
        }
      }
    }
  }
  function dump2(input, options2) {
    options2 = options2 || {};
    const state = new State(options2);
    if (!state.noRefs) getDuplicateReferences(input, state);
    let value = input;
    if (state.replacer) {
      value = state.replacer.call({ "": value }, "", value);
    }
    if (writeNode(state, 0, value, true, true)) return state.dump + "\n";
    return "";
  }
  dumper.dump = dump2;
  return dumper;
}
var hasRequiredJsYaml;
function requireJsYaml() {
  if (hasRequiredJsYaml) return jsYaml;
  hasRequiredJsYaml = 1;
  const loader2 = requireLoader();
  const dumper2 = requireDumper();
  function renamed(from, to) {
    return function() {
      throw new Error("Function yaml." + from + " is removed in js-yaml 4. Use yaml." + to + " instead, which is now safe by default.");
    };
  }
  jsYaml.Type = requireType();
  jsYaml.Schema = requireSchema();
  jsYaml.FAILSAFE_SCHEMA = requireFailsafe();
  jsYaml.JSON_SCHEMA = requireJson();
  jsYaml.CORE_SCHEMA = requireCore();
  jsYaml.DEFAULT_SCHEMA = require_default();
  jsYaml.load = loader2.load;
  jsYaml.loadAll = loader2.loadAll;
  jsYaml.dump = dumper2.dump;
  jsYaml.YAMLException = requireException();
  jsYaml.types = {
    binary: requireBinary(),
    float: requireFloat(),
    map: requireMap(),
    null: require_null(),
    pairs: requirePairs(),
    set: requireSet(),
    timestamp: requireTimestamp(),
    bool: requireBool(),
    int: requireInt(),
    merge: requireMerge(),
    omap: requireOmap(),
    seq: requireSeq(),
    str: requireStr()
  };
  jsYaml.safeLoad = renamed("safeLoad", "load");
  jsYaml.safeLoadAll = renamed("safeLoadAll", "loadAll");
  jsYaml.safeDump = renamed("safeDump", "dump");
  return jsYaml;
}
var jsYamlExports = requireJsYaml();
var yaml = /* @__PURE__ */ getDefaultExportFromCjs(jsYamlExports);
var {
  Type,
  Schema,
  FAILSAFE_SCHEMA,
  JSON_SCHEMA,
  CORE_SCHEMA,
  DEFAULT_SCHEMA,
  load,
  loadAll,
  dump,
  YAMLException,
  types,
  safeLoad,
  safeLoadAll,
  safeDump
} = yaml;

// src/generator/dns.ts
var DEFAULT_DNS_CONFIG = {
  enable: true,
  listen: "127.0.0.1:5335",
  "enhanced-mode": "fake-ip",
  "fake-ip-range": "198.18.0.1/16",
  "use-system-hosts": false,
  "default-nameserver": [
    "180.76.76.76",
    "182.254.118.118",
    "8.8.8.8",
    "180.184.2.2"
  ],
  nameserver: [
    "180.76.76.76",
    "119.29.29.29",
    "180.184.1.1",
    "223.5.5.5",
    "8.8.8.8",
    "https://223.6.6.6/dns-query#h3=true",
    "https://dns.alidns.com/dns-query",
    "https://cloudflare-dns.com/dns-query",
    "https://doh.pub/dns-query"
  ],
  fallback: [
    "https://dns.quad9.net/dns-query",
    "https://dns.alidns.com/dns-query",
    "https://doh.pub/dns-query",
    "https://public.dns.iij.jp/dns-query",
    "https://101.101.101.101/dns-query",
    "https://208.67.220.220/dns-query",
    "tls://8.8.4.4",
    "tls://1.0.0.1:853",
    "https://cloudflare-dns.com/dns-query",
    "https://dns.google/dns-query"
  ],
  "fallback-filter": {
    geoip: true,
    ipcidr: ["240.0.0.0/4", "0.0.0.0/32", "127.0.0.1/32"],
    domain: [
      "+.google.com",
      "+.facebook.com",
      "+.twitter.com",
      "+.youtube.com",
      "+.xn--ngstr-lra8j.com",
      "+.google.cn",
      "+.googleapis.cn",
      "+.googleapis.com",
      "+.gvt1.com"
    ]
  },
  "fake-ip-filter": [
    "*.lan",
    "stun.*.*.*",
    "stun.*.*",
    "time.windows.com",
    "time.nist.gov",
    "time.apple.com",
    "time.asia.apple.com",
    "*.ntp.org.cn",
    "*.openwrt.pool.ntp.org",
    "time1.cloud.tencent.com",
    "time.ustc.edu.cn",
    "pool.ntp.org",
    "ntp.ubuntu.com",
    "ntp.aliyun.com",
    "ntp1.aliyun.com",
    "ntp2.aliyun.com",
    "ntp3.aliyun.com",
    "ntp4.aliyun.com",
    "ntp5.aliyun.com",
    "ntp6.aliyun.com",
    "ntp7.aliyun.com",
    "time1.aliyun.com",
    "time2.aliyun.com",
    "time3.aliyun.com",
    "time4.aliyun.com",
    "time5.aliyun.com",
    "time6.aliyun.com",
    "time7.aliyun.com",
    "*.time.edu.cn",
    "time1.apple.com",
    "time2.apple.com",
    "time3.apple.com",
    "time4.apple.com",
    "time5.apple.com",
    "time6.apple.com",
    "time7.apple.com",
    "time1.google.com",
    "time2.google.com",
    "time3.google.com",
    "time4.google.com",
    "music.163.com",
    "*.music.163.com",
    "*.126.net",
    "musicapi.taihe.com",
    "music.taihe.com",
    "songsearch.kugou.com",
    "trackercdn.kugou.com",
    "*.kuwo.cn",
    "api-jooxtt.sanook.com",
    "api.joox.com",
    "joox.com",
    "y.qq.com",
    "*.y.qq.com",
    "streamoc.music.tc.qq.com",
    "mobileoc.music.tc.qq.com",
    "isure.stream.qqmusic.qq.com",
    "dl.stream.qqmusic.qq.com",
    "aqqmusic.tc.qq.com",
    "amobile.music.tc.qq.com",
    "*.xiami.com",
    "*.music.migu.cn",
    "music.migu.cn",
    "*.msftconnecttest.com",
    "*.msftncsi.com",
    "localhost.ptlogin2.qq.com",
    "*.*.*.srv.nintendo.net",
    "*.*.stun.playstation.net",
    "xbox.*.*.microsoft.com",
    "*.ipv6.microsoft.com",
    "*.*.xboxlive.com",
    "speedtest.cros.wr.pvp.net"
  ]
};

// src/rules/provider-config.ts
var RULE_PROVIDER_CONFIG = {
  baseUrl: "https://github.com/MetaCubeX/meta-rules-dat/raw/refs/heads/meta/geo",
  github: {
    owner: "MetaCubeX",
    repo: "meta-rules-dat",
    ref: "meta"
  },
  treePath: "geo",
  directories: {
    geosite: "geosite",
    geoip: "geoip"
  },
  cacheTtlMs: 24 * 60 * 60 * 1e3,
  categories: {
    ads: { name: "\u5E7F\u544A\u62E6\u622A", emoji: "\u{1F6D1}" },
    ai: { name: "AI \u670D\u52A1", emoji: "\u{1F916}" },
    common: { name: "\u5E38\u7528\u670D\u52A1", emoji: "\u{1F310}" },
    media: { name: "\u6D41\u5A92\u4F53", emoji: "\u{1F3AC}" },
    social: { name: "\u793E\u4EA4\u901A\u8BAF", emoji: "\u{1F4AC}" },
    game: { name: "\u6E38\u620F\u5E73\u53F0", emoji: "\u{1F3AE}" },
    tech: { name: "\u6280\u672F\u670D\u52A1", emoji: "\u{1F6E0}\uFE0F" },
    finance: { name: "\u91D1\u878D\u670D\u52A1", emoji: "\u{1F4B0}" },
    geo: { name: "\u5730\u7406\u4F4D\u7F6E", emoji: "\u{1F5FA}\uFE0F" },
    edu: { name: "\u6559\u80B2\u5B66\u672F", emoji: "\u{1F393}" },
    shopping: { name: "\u8D2D\u7269\u7535\u5546", emoji: "\u{1F6CD}\uFE0F" },
    news: { name: "\u65B0\u95FB\u8D44\u8BAF", emoji: "\u{1F4F0}" },
    cn: { name: "\u4E2D\u56FD\u670D\u52A1", emoji: "\u{1F1E8}\u{1F1F3}" },
    privacy: { name: "\u9690\u79C1\u5B89\u5168", emoji: "\u{1F512}" },
    other: { name: "\u5176\u4ED6", emoji: "\u2728" }
  }
};
var DEFAULT_RULE_PROVIDER_BASE_URL = RULE_PROVIDER_CONFIG.baseUrl;
var RULE_CATEGORIES = RULE_PROVIDER_CONFIG.categories;

// src/types/config.ts
var LOAD_BALANCE_STRATEGIES = ["consistent-hashing", "round-robin", "sticky-sessions"];
var DEFAULT_LOAD_BALANCE_STRATEGY = "consistent-hashing";
function isLoadBalanceStrategy(value) {
  return typeof value === "string" && LOAD_BALANCE_STRATEGIES.includes(value);
}

// src/subscription/node-source-state.ts
var SOURCE_IDS_KEY = "_sourceIds";
function getNodeSourceIds(node) {
  const record = node;
  const raw = record[SOURCE_IDS_KEY];
  if (!Array.isArray(raw)) return [];
  const out = [];
  const seen = /* @__PURE__ */ new Set();
  for (const item of raw) {
    if (typeof item !== "string") continue;
    const id = item.trim();
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  return out;
}

// src/proxy-group-targets.ts
function isProxyGroupTargetRef(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const item = value;
  return (item.kind === "module" || item.kind === "custom") && typeof item.id === "string" && Boolean(item.id.trim());
}
function normalizeProxyGroupTargetRef(value) {
  if (!isProxyGroupTargetRef(value)) return null;
  return { kind: value.kind, id: value.id.trim() };
}
function getProxyGroupMemberKey(member) {
  switch (member.kind) {
    case "node":
      return `node:${member.name}`;
    case "module":
      return `module:${member.id}`;
    case "custom":
      return `custom:${member.id}`;
    case "direct":
      return "direct:DIRECT";
    case "reject":
      return "reject:REJECT";
  }
}
function resolveProxyGroupTargetName(target, options2) {
  if (typeof target === "string") {
    return target.trim() || options2.fallbackTarget || "";
  }
  const normalized = normalizeProxyGroupTargetRef(target);
  if (!normalized) return options2.fallbackTarget || "";
  if (normalized.kind === "module") {
    const moduleName = Object.prototype.hasOwnProperty.call(options2.moduleNames, normalized.id) ? options2.moduleNames[normalized.id] : void 0;
    return (typeof moduleName === "string" ? moduleName.trim() : "") || options2.fallbackTarget || "";
  }
  const customName = (options2.customProxyGroups || []).find((group) => group.id === normalized.id)?.name?.trim();
  return customName || options2.fallbackTarget || "";
}

// src/proxy-group-advanced.ts
var REGION_PRESETS = [
  { id: "us", label: "\u7F8E\u56FD", emoji: "\u{1F1FA}\u{1F1F8}", keywords: ["\u7F8E\u56FD", "US", "USA", "United States", "\u6D1B\u6749\u77F6", "\u7EBD\u7EA6", "\u897F\u96C5\u56FE"] },
  { id: "hk", label: "\u9999\u6E2F", emoji: "\u{1F1ED}\u{1F1F0}", keywords: ["\u9999\u6E2F", "HK", "Hong Kong", "\u6E2F"] },
  { id: "jp", label: "\u65E5\u672C", emoji: "\u{1F1EF}\u{1F1F5}", keywords: ["\u65E5\u672C", "JP", "Japan", "\u4E1C\u4EAC", "\u5927\u962A"] },
  { id: "sg", label: "\u65B0\u52A0\u5761", emoji: "\u{1F1F8}\u{1F1EC}", keywords: ["\u65B0\u52A0\u5761", "SG", "Singapore", "\u72EE\u57CE"] },
  { id: "tw", label: "\u53F0\u6E7E", emoji: "\u{1F1F9}\u{1F1FC}", keywords: ["\u53F0\u6E7E", "TW", "Taiwan", "\u53F0\u5317"] },
  { id: "kr", label: "\u97E9\u56FD", emoji: "\u{1F1F0}\u{1F1F7}", keywords: ["\u97E9\u56FD", "KR", "Korea", "\u9996\u5C14"] },
  { id: "uk", label: "\u82F1\u56FD", emoji: "\u{1F1EC}\u{1F1E7}", keywords: ["\u82F1\u56FD", "UK", "United Kingdom", "London", "\u4F26\u6566"] },
  { id: "de", label: "\u5FB7\u56FD", emoji: "\u{1F1E9}\u{1F1EA}", keywords: ["\u5FB7\u56FD", "DE", "Germany", "Frankfurt", "\u6CD5\u5170\u514B\u798F"] },
  { id: "fr", label: "\u6CD5\u56FD", emoji: "\u{1F1EB}\u{1F1F7}", keywords: ["\u6CD5\u56FD", "FR", "France", "Paris", "\u5DF4\u9ECE"] },
  { id: "ca", label: "\u52A0\u62FF\u5927", emoji: "\u{1F1E8}\u{1F1E6}", keywords: ["\u52A0\u62FF\u5927", "CA", "Canada", "Toronto", "\u591A\u4F26\u591A"] },
  { id: "au", label: "\u6FB3\u5927\u5229\u4E9A", emoji: "\u{1F1E6}\u{1F1FA}", keywords: ["\u6FB3\u5927\u5229\u4E9A", "AU", "Australia", "Sydney", "\u6089\u5C3C"] },
  { id: "other", label: "\u5176\u4ED6", emoji: "\u{1F310}", keywords: [] }
];
var NODE_REGIONS = new Set(REGION_PRESETS.map((preset) => preset.id));
function compileRegex(pattern) {
  const raw = typeof pattern === "string" ? pattern.trim() : "";
  if (!raw) return null;
  try {
    return new RegExp(raw, "i");
  } catch {
    return null;
  }
}
function matchesRegion(nodeName, regions) {
  if (!Array.isArray(regions) || regions.length === 0) return true;
  const normalized = nodeName.toLowerCase();
  for (const region of regions) {
    if (region === "other") continue;
    const preset = REGION_PRESETS.find((item) => item.id === region);
    if (!preset) continue;
    if (preset.keywords.some((keyword) => normalized.includes(keyword.toLowerCase()))) return true;
  }
  if (regions.includes("other")) {
    for (const preset of REGION_PRESETS) {
      if (preset.id === "other") continue;
      if (preset.keywords.some((keyword) => normalized.includes(keyword.toLowerCase()))) return false;
    }
    return true;
  }
  return false;
}
function normalizeStringList(value) {
  if (!Array.isArray(value)) return [];
  const out = [];
  const seen = /* @__PURE__ */ new Set();
  for (const item of value) {
    if (typeof item !== "string") continue;
    const trimmed = item.trim();
    if (!trimmed || seen.has(trimmed)) continue;
    seen.add(trimmed);
    out.push(trimmed);
  }
  return out;
}
function normalizeRegions(value) {
  if (!Array.isArray(value)) return [];
  const out = [];
  const seen = /* @__PURE__ */ new Set();
  for (const item of value) {
    if (typeof item !== "string") continue;
    const key = item.trim().toLowerCase();
    if (!NODE_REGIONS.has(key) || seen.has(key)) continue;
    seen.add(key);
    out.push(key);
  }
  return out;
}
function normalizeGroupType(value) {
  if (value === "select" || value === "url-test" || value === "fallback" || value === "load-balance" || value === "direct-first" || value === "reject-first") {
    return value;
  }
  return null;
}
function normalizeProxyGroupMemberRef(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const item = value;
  if (item.kind === "direct") return { kind: "direct" };
  if (item.kind === "reject") return { kind: "reject" };
  if (item.kind === "node" && typeof item.name === "string" && item.name.trim()) {
    return { kind: "node", name: item.name.trim() };
  }
  if (item.kind === "module" && typeof item.id === "string" && item.id.trim()) {
    return { kind: "module", id: item.id.trim() };
  }
  if (item.kind === "custom" && typeof item.id === "string" && item.id.trim()) {
    return { kind: "custom", id: item.id.trim() };
  }
  return null;
}
function normalizeMemberList(value) {
  if (!Array.isArray(value)) return [];
  const out = [];
  const seen = /* @__PURE__ */ new Set();
  for (const item of value) {
    const ref = normalizeProxyGroupMemberRef(item);
    if (!ref) continue;
    const key = getProxyGroupMemberKey(ref);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(ref);
  }
  return out;
}
function normalizeGroupTestUrl(value) {
  if (typeof value !== "string" || !value.trim()) return void 0;
  try {
    const url = new URL(value.trim());
    return ["http:", "https:"].includes(url.protocol) && !url.username && !url.password ? value.trim() : void 0;
  } catch {
    return void 0;
  }
}
function normalizeProxyGroupAdvancedConfig(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const item = value;
  const sourceIds = normalizeStringList(item.sourceIds);
  const regions = normalizeRegions(item.regions);
  const includeRegex = typeof item.includeRegex === "string" ? item.includeRegex.trim() : "";
  const excludeRegex = typeof item.excludeRegex === "string" ? item.excludeRegex.trim() : "";
  const groupType = normalizeGroupType(item.groupType);
  const strategy = groupType === "load-balance" && isLoadBalanceStrategy(item.strategy) ? item.strategy : groupType === "load-balance" ? DEFAULT_LOAD_BALANCE_STRATEGY : void 0;
  const extraMembers = normalizeMemberList(item.extraMembers);
  const excludedMembers = normalizeMemberList(item.excludedMembers);
  const memberOrder = normalizeMemberList(item.memberOrder);
  const testUrl = normalizeGroupTestUrl(item.testUrl);
  return {
    ...testUrl ? { testUrl } : {},
    ...sourceIds.length > 0 ? { sourceIds } : {},
    ...regions.length > 0 ? { regions } : {},
    ...includeRegex ? { includeRegex } : {},
    ...excludeRegex ? { excludeRegex } : {},
    ...groupType ? { groupType } : {},
    ...strategy ? { strategy } : {},
    ...extraMembers.length > 0 ? { extraMembers } : {},
    ...excludedMembers.length > 0 ? { excludedMembers } : {},
    ...memberOrder.length > 0 ? { memberOrder } : {}
  };
}
function buildMemberFromName(name, options2) {
  const trimmed = name.trim();
  if (!trimmed) return null;
  let ref = null;
  if (trimmed === "DIRECT") ref = { kind: "direct" };
  else if (trimmed === "REJECT") ref = { kind: "reject" };
  else if (options2.nodeNameSet.has(trimmed)) ref = { kind: "node", name: trimmed };
  else {
    const moduleId = options2.moduleNameToId.get(trimmed);
    if (moduleId) ref = { kind: "module", id: moduleId };
    const customId = options2.customNameToId.get(trimmed);
    if (!ref && customId) ref = { kind: "custom", id: customId };
  }
  if (!ref) return null;
  return {
    ref,
    key: getProxyGroupMemberKey(ref),
    name: trimmed,
    kind: ref.kind
  };
}
function buildMemberFromRef(ref, options2) {
  const key = getProxyGroupMemberKey(ref);
  if (ref.kind === "direct") return { ref, key, name: "DIRECT", kind: ref.kind };
  if (ref.kind === "reject") return { ref, key, name: "REJECT", kind: ref.kind };
  if (ref.kind === "node") {
    const name2 = ref.name.trim();
    return name2 && options2.nodeNameSet.has(name2) ? { ref: { kind: "node", name: name2 }, key, name: name2, kind: ref.kind } : null;
  }
  if (ref.kind === "module") {
    const name2 = options2.moduleNames[ref.id]?.trim();
    return name2 ? { ref, key, name: name2, kind: ref.kind } : null;
  }
  const group = options2.customGroupsById.get(ref.id);
  const name = group?.name?.trim();
  return name ? { ref, key, name, kind: ref.kind } : null;
}
function nodePassesAdvancedFilters(member, nodeByName, advanced) {
  if (member.ref.kind !== "node") return true;
  const node = nodeByName.get(member.ref.name);
  if (!node) return false;
  const sourceIds = normalizeStringList(advanced.sourceIds);
  if (sourceIds.length > 0) {
    const sourceIdSet = new Set(sourceIds);
    if (!getNodeSourceIds(node).some((id) => sourceIdSet.has(id))) return false;
  }
  const regions = normalizeRegions(advanced.regions);
  if (!matchesRegion(member.ref.name, regions)) return false;
  const includeRe = compileRegex(advanced.includeRegex);
  if (includeRe && !includeRe.test(member.ref.name)) return false;
  const excludeRe = compileRegex(advanced.excludeRegex);
  if (excludeRe && excludeRe.test(member.ref.name)) return false;
  return true;
}
function resolveProxyGroupMembers(options2) {
  const advanced = normalizeProxyGroupAdvancedConfig(options2.advanced);
  const nodeByName = new Map(options2.nodes.map((node) => [node.name, node]));
  const nodeNameSet = new Set(nodeByName.keys());
  const moduleNameToId = /* @__PURE__ */ new Map();
  for (const [id, name] of Object.entries(options2.moduleNames || {})) {
    const trimmed = name.trim();
    if (id && trimmed) moduleNameToId.set(trimmed, id);
  }
  const customNameToId = /* @__PURE__ */ new Map();
  const customGroupsById = /* @__PURE__ */ new Map();
  for (const group of options2.customProxyGroups || []) {
    if (group.enabled === false) continue;
    const name = typeof group.name === "string" ? group.name.trim() : "";
    if (group.id && name) {
      customNameToId.set(name, group.id);
      customGroupsById.set(group.id, group);
    }
  }
  const buildMembersFromNames = (names) => {
    const out = [];
    const seen = /* @__PURE__ */ new Set();
    for (const rawName of names || []) {
      if (typeof rawName !== "string") continue;
      const member = buildMemberFromName(rawName, { nodeNameSet, moduleNameToId, customNameToId });
      if (!member || seen.has(member.key)) continue;
      if (options2.self && member.key === `${options2.self.kind}:${options2.self.id}`) continue;
      seen.add(member.key);
      out.push(member);
    }
    return out;
  };
  const defaultCandidates = buildMembersFromNames(options2.defaultProxyNames || []);
  const availableCandidates = buildMembersFromNames(options2.availableProxyNames || options2.defaultProxyNames || []);
  const availableByKey = new Map(availableCandidates.map((member) => [member.key, member]));
  const candidateMap = new Map(defaultCandidates.map((member) => [member.key, member]));
  for (const ref of advanced.extraMembers || []) {
    const member = availableByKey.get(getProxyGroupMemberKey(ref)) || buildMemberFromRef(ref, {
      nodeNameSet,
      moduleNames: options2.moduleNames || {},
      customGroupsById
    });
    if (!member || candidateMap.has(member.key)) continue;
    if (options2.self && member.key === `${options2.self.kind}:${options2.self.id}`) continue;
    candidateMap.set(member.key, member);
  }
  const candidates = Array.from(candidateMap.values());
  const extraKeys = new Set((advanced.extraMembers || []).map(getProxyGroupMemberKey));
  const excludedKeys = new Set((advanced.excludedMembers || []).map(getProxyGroupMemberKey));
  const includedBase = candidates.filter((member) => {
    if (excludedKeys.has(member.key)) return false;
    if (extraKeys.has(member.key)) return true;
    return nodePassesAdvancedFilters(member, nodeByName, advanced);
  });
  const byKey = new Map(includedBase.map((member) => [member.key, member]));
  const ordered = [];
  const used = /* @__PURE__ */ new Set();
  for (const ref of advanced.memberOrder || []) {
    const key = getProxyGroupMemberKey(ref);
    const member = byKey.get(key);
    if (!member || used.has(key)) continue;
    used.add(key);
    ordered.push(member);
  }
  for (const member of includedBase) {
    if (used.has(member.key)) continue;
    used.add(member.key);
    ordered.push(member);
  }
  const includedKeys = new Set(ordered.map((member) => member.key));
  const excludedSource = availableCandidates.length > 0 ? availableCandidates : candidates;
  const excluded = excludedSource.filter((member) => !includedKeys.has(member.key));
  return {
    included: ordered,
    excluded,
    proxyNames: ordered.map((member) => member.name)
  };
}

// src/subscription/info-node-name.ts
var SUBSCRIPTION_INFO_NODE_NAME_RE = /^(剩余流量|剩余订阅流量|距离下次重置剩余|套餐到期|订阅到期|到期时间|过期时间)\s*[:：]/;
var PIPE_STYLE_ACCOUNT_INFO_NODE_NAME_RE = /^(余额|会员)\s*\|/;
var SUBSCRIPTION_UPDATE_HINT_NODE_NAME_RE = /(版本太旧|请更新|更新软件|去官网更新)/;
function isSubscriptionInfoNodeName(name) {
  const trimmed = name.trim();
  return SUBSCRIPTION_INFO_NODE_NAME_RE.test(trimmed) || PIPE_STYLE_ACCOUNT_INFO_NODE_NAME_RE.test(trimmed) || SUBSCRIPTION_UPDATE_HINT_NODE_NAME_RE.test(trimmed);
}

// src/generator/proxy-group-modules.ts
var PROXY_GROUP_MODULES = [
  // ==================== 核心组 ====================
  {
    id: "select",
    name: "\u{1F680} \u8282\u70B9\u9009\u62E9",
    emoji: "\u{1F680}",
    category: "core",
    description: "\u624B\u52A8\u9009\u62E9\u4EE3\u7406\u8282\u70B9",
    groupType: "select",
    rules: []
  },
  {
    id: "auto",
    name: "\u26A1 \u81EA\u52A8\u9009\u62E9",
    emoji: "\u26A1",
    category: "core",
    description: "\u81EA\u52A8\u9009\u62E9\u6700\u5FEB\u8282\u70B9",
    groupType: "url-test",
    rules: []
  },
  {
    id: "ad",
    name: "\u{1F6D1} \u5E7F\u544A\u62E6\u622A",
    emoji: "\u{1F6D1}",
    category: "core",
    description: "\u62E6\u622A\u5E7F\u544A\u548C\u8FFD\u8E2A\u5668",
    groupType: "reject-first",
    rules: [
      { id: "category-ads-all", name: "\u5E7F\u544A\u57DF\u540D", behavior: "domain", path: "geosite/category-ads-all.mrs" }
    ]
  },
  {
    id: "private",
    name: "\u{1F3E0} \u79C1\u6709\u7F51\u7EDC",
    emoji: "\u{1F3E0}",
    category: "core",
    description: "\u5C40\u57DF\u7F51\u548C\u79C1\u6709IP\u76F4\u8FDE",
    groupType: "direct-first",
    rules: [
      { id: "private", name: "\u79C1\u6709\u7F51\u7EDC", behavior: "domain", path: "geosite/private.mrs" },
      { id: "private-ip", name: "\u79C1\u6709IP", behavior: "ipcidr", path: "geoip/private.mrs", noResolve: true }
    ]
  },
  {
    id: "cn",
    name: "\u{1F512} \u56FD\u5185\u670D\u52A1",
    emoji: "\u{1F512}",
    category: "core",
    description: "\u56FD\u5185\u7F51\u7AD9\u548C\u670D\u52A1\u76F4\u8FDE",
    groupType: "direct-first",
    rules: [
      { id: "geolocation-cn", name: "\u56FD\u5185\u57DF\u540D (\u7CBE\u7B80)", behavior: "domain", path: "geosite/geolocation-cn.mrs" },
      { id: "cn-ip", name: "\u56FD\u5185IP", behavior: "ipcidr", path: "geoip/cn.mrs", noResolve: true }
    ]
  },
  {
    id: "global",
    name: "\u{1F30D} \u975E\u4E2D\u56FD",
    emoji: "\u{1F30D}",
    category: "core",
    description: "\u975E\u4E2D\u56FD\u57DF\u540D\u8D70\u4EE3\u7406",
    groupType: "select",
    rules: [
      { id: "geolocation-!cn", name: "\u975E\u4E2D\u56FD\u57DF\u540D", behavior: "domain", path: "geosite/geolocation-!cn.mrs" }
    ]
  },
  {
    id: "final",
    name: "\u{1F41F} \u6F0F\u7F51\u4E4B\u9C7C",
    emoji: "\u{1F41F}",
    category: "core",
    description: "\u672A\u5339\u914D\u5230\u4EFB\u4F55\u89C4\u5219\u7684\u6D41\u91CF",
    groupType: "select",
    rules: []
  },
  // ==================== 常用服务 ====================
  {
    id: "ai",
    name: "\u{1F916} AI \u670D\u52A1",
    emoji: "\u{1F916}",
    category: "service",
    description: "ChatGPT\u3001Claude\u3001Copilot \u7B49",
    groupType: "select",
    rules: [
      { id: "openai", name: "OpenAI", behavior: "domain", path: "geosite/openai.mrs" },
      { id: "anthropic", name: "Anthropic (Claude)", behavior: "domain", path: "geosite/anthropic.mrs" },
      { id: "category-ai-chat-!cn", name: "AI\u670D\u52A1\u5408\u96C6", behavior: "domain", path: "geosite/category-ai-chat-!cn.mrs" }
    ]
  },
  {
    id: "gemini",
    name: "\u2728 Gemini",
    emoji: "\u2728",
    category: "service",
    description: "Google Gemini (Bard) \u7B49",
    groupType: "select",
    rules: [{ id: "google-gemini", name: "Google Gemini", behavior: "domain", path: "geosite/google-gemini.mrs" }]
  },
  {
    id: "youtube",
    name: "\u{1F4F9} \u6CB9\u7BA1\u89C6\u9891",
    emoji: "\u{1F4F9}",
    category: "service",
    description: "YouTube \u89C6\u9891\u3001YouTube Music",
    groupType: "select",
    rules: [
      { id: "youtube", name: "YouTube", behavior: "domain", path: "geosite/youtube.mrs" }
    ]
  },
  {
    id: "google",
    name: "\u{1F50D} \u8C37\u6B4C\u670D\u52A1",
    emoji: "\u{1F50D}",
    category: "service",
    description: "Google \u641C\u7D22\u3001Gmail\u3001Drive",
    groupType: "select",
    rules: [
      { id: "google", name: "Google", behavior: "domain", path: "geosite/google.mrs" },
      { id: "google-ip", name: "Google IP", behavior: "ipcidr", path: "geoip/google.mrs", noResolve: true }
    ]
  },
  {
    id: "microsoft",
    name: "\u24C2\uFE0F \u5FAE\u8F6F\u670D\u52A1",
    emoji: "\u24C2\uFE0F",
    category: "service",
    description: "Microsoft 365\u3001Azure\u3001Bing",
    groupType: "select",
    rules: [
      { id: "microsoft", name: "Microsoft", behavior: "domain", path: "geosite/microsoft.mrs" },
      { id: "onedrive", name: "OneDrive", behavior: "domain", path: "geosite/onedrive.mrs" }
    ]
  },
  {
    id: "apple",
    name: "\u{1F34F} \u82F9\u679C\u670D\u52A1",
    emoji: "\u{1F34F}",
    category: "service",
    description: "iCloud\u3001App Store",
    groupType: "select",
    rules: [
      { id: "apple", name: "Apple", behavior: "domain", path: "geosite/apple.mrs" },
      { id: "icloud", name: "iCloud", behavior: "domain", path: "geosite/icloud.mrs" }
    ]
  },
  // ==================== 社交通讯 ====================
  {
    id: "telegram",
    name: "\u{1F4F2} \u7535\u62A5\u6D88\u606F",
    emoji: "\u{1F4F2}",
    category: "social",
    description: "Telegram \u6D88\u606F\u548C\u901A\u8BDD",
    groupType: "select",
    rules: [
      { id: "telegram", name: "Telegram", behavior: "domain", path: "geosite/telegram.mrs" },
      { id: "telegram-ip", name: "Telegram IP", behavior: "ipcidr", path: "geoip/telegram.mrs", noResolve: true }
    ]
  },
  {
    id: "twitter",
    name: "\u{1F426} \u63A8\u7279/X",
    emoji: "\u{1F426}",
    category: "social",
    description: "Twitter/X \u793E\u4EA4\u5E73\u53F0",
    groupType: "select",
    rules: [
      { id: "twitter", name: "Twitter/X", behavior: "domain", path: "geosite/twitter.mrs" },
      { id: "twitter-ip", name: "Twitter IP", behavior: "ipcidr", path: "geoip/twitter.mrs", noResolve: true }
    ]
  },
  {
    id: "meta",
    name: "\u{1F4D8} Meta \u7CFB",
    emoji: "\u{1F4D8}",
    category: "social",
    description: "Facebook\u3001Instagram",
    groupType: "select",
    rules: [
      { id: "facebook", name: "Facebook", behavior: "domain", path: "geosite/facebook.mrs" },
      { id: "instagram", name: "Instagram", behavior: "domain", path: "geosite/instagram.mrs" },
      { id: "whatsapp", name: "WhatsApp", behavior: "domain", path: "geosite/whatsapp.mrs" },
      { id: "facebook-ip", name: "Facebook IP", behavior: "ipcidr", path: "geoip/facebook.mrs", noResolve: true }
    ]
  },
  {
    id: "discord",
    name: "\u{1F399}\uFE0F Discord",
    emoji: "\u{1F399}\uFE0F",
    category: "social",
    description: "Discord \u8BED\u97F3\u804A\u5929",
    groupType: "select",
    rules: [
      { id: "discord", name: "Discord", behavior: "domain", path: "geosite/discord.mrs" }
    ]
  },
  {
    id: "social-other",
    name: "\u{1F4AC} \u5176\u4ED6\u793E\u4EA4",
    emoji: "\u{1F4AC}",
    category: "social",
    description: "TikTok\u3001Line\u3001Reddit",
    groupType: "select",
    rules: [
      { id: "tiktok", name: "TikTok", behavior: "domain", path: "geosite/tiktok.mrs" },
      { id: "line", name: "Line", behavior: "domain", path: "geosite/line.mrs" },
      { id: "reddit", name: "Reddit", behavior: "domain", path: "geosite/reddit.mrs" },
      { id: "linkedin", name: "LinkedIn", behavior: "domain", path: "geosite/linkedin.mrs" },
      { id: "snap", name: "Snapchat", behavior: "domain", path: "geosite/snap.mrs" },
      { id: "pinterest", name: "Pinterest", behavior: "domain", path: "geosite/pinterest.mrs" },
      { id: "tumblr", name: "Tumblr", behavior: "domain", path: "geosite/tumblr.mrs" }
    ]
  },
  // ==================== 流媒体 ====================
  {
    id: "netflix",
    name: "\u{1F3AC} \u5948\u98DE",
    emoji: "\u{1F3AC}",
    category: "media",
    description: "Netflix \u89C6\u9891",
    groupType: "select",
    rules: [
      { id: "netflix", name: "Netflix", behavior: "domain", path: "geosite/netflix.mrs" },
      { id: "netflix-ip", name: "Netflix IP", behavior: "ipcidr", path: "geoip/netflix.mrs", noResolve: true }
    ]
  },
  {
    id: "disney",
    name: "\u{1F3F0} \u8FEA\u58EB\u5C3C+",
    emoji: "\u{1F3F0}",
    category: "media",
    description: "Disney+ \u89C6\u9891",
    groupType: "select",
    rules: [
      { id: "disney", name: "Disney+", behavior: "domain", path: "geosite/disney.mrs" }
    ]
  },
  {
    id: "streaming-west",
    name: "\u{1F4FA} \u6B27\u7F8E\u6D41\u5A92\u4F53",
    emoji: "\u{1F4FA}",
    category: "media",
    description: "HBO\u3001Hulu\u3001Prime Video",
    groupType: "select",
    rules: [
      { id: "hbo", name: "HBO", behavior: "domain", path: "geosite/hbo.mrs" },
      { id: "hulu", name: "Hulu", behavior: "domain", path: "geosite/hulu.mrs" },
      { id: "primevideo", name: "Prime Video", behavior: "domain", path: "geosite/primevideo.mrs" },
      { id: "apple-tvplus", name: "Apple TV+", behavior: "domain", path: "geosite/apple-tvplus.mrs" },
      { id: "spotify", name: "Spotify", behavior: "domain", path: "geosite/spotify.mrs" },
      { id: "twitch", name: "Twitch", behavior: "domain", path: "geosite/twitch.mrs" },
      { id: "dazn", name: "DAZN", behavior: "domain", path: "geosite/dazn.mrs" }
    ]
  },
  {
    id: "streaming-asia",
    name: "\u{1F38C} \u4E9A\u6D32\u6D41\u5A92\u4F53",
    emoji: "\u{1F38C}",
    category: "media",
    description: "\u5DF4\u54C8\u59C6\u7279\u3001Abema\u3001Viu\u3001KKTV \u7B49",
    groupType: "select",
    rules: [
      { id: "bahamut", name: "\u5DF4\u54C8\u59C6\u7279", behavior: "domain", path: "geosite/bahamut.mrs" },
      { id: "biliintl", name: "\u54D4\u54E9\u54D4\u54E9\u56FD\u9645\u7248", behavior: "domain", path: "geosite/biliintl.mrs" },
      { id: "niconico", name: "Niconico", behavior: "domain", path: "geosite/niconico.mrs" },
      { id: "abema", name: "Abema", behavior: "domain", path: "geosite/abema.mrs" },
      { id: "viu", name: "Viu", behavior: "domain", path: "geosite/viu.mrs" },
      { id: "kktv", name: "KKTV", behavior: "domain", path: "geosite/kktv.mrs" }
    ]
  },
  // ==================== 游戏平台 ====================
  {
    id: "steam",
    name: "\u{1F3AE} Steam",
    emoji: "\u{1F3AE}",
    category: "game",
    description: "Steam \u6E38\u620F\u5E73\u53F0",
    groupType: "select",
    rules: [
      { id: "steam", name: "Steam", behavior: "domain", path: "geosite/steam.mrs" }
    ]
  },
  {
    id: "gaming-pc",
    name: "\u{1F5A5}\uFE0F PC \u6E38\u620F",
    emoji: "\u{1F5A5}\uFE0F",
    category: "game",
    description: "Epic\u3001EA\u3001Ubisoft\u3001GOG",
    groupType: "select",
    rules: [
      { id: "epicgames", name: "Epic Games", behavior: "domain", path: "geosite/epicgames.mrs" },
      { id: "ea", name: "EA", behavior: "domain", path: "geosite/ea.mrs" },
      { id: "ubisoft", name: "Ubisoft", behavior: "domain", path: "geosite/ubisoft.mrs" },
      { id: "blizzard", name: "Blizzard", behavior: "domain", path: "geosite/blizzard.mrs" },
      { id: "gog", name: "GOG", behavior: "domain", path: "geosite/gog.mrs" },
      { id: "riot", name: "Riot Games", behavior: "domain", path: "geosite/riot.mrs" }
    ]
  },
  {
    id: "gaming-console",
    name: "\u{1F3AF} \u4E3B\u673A\u6E38\u620F",
    emoji: "\u{1F3AF}",
    category: "game",
    description: "PlayStation\u3001Xbox",
    groupType: "select",
    rules: [
      { id: "playstation", name: "PlayStation", behavior: "domain", path: "geosite/playstation.mrs" },
      { id: "xbox", name: "Xbox", behavior: "domain", path: "geosite/xbox.mrs" },
      { id: "nintendo", name: "Nintendo", behavior: "domain", path: "geosite/nintendo.mrs" }
    ]
  },
  // ==================== 技术服务 ====================
  {
    id: "github",
    name: "\u{1F431} \u4EE3\u7801\u6258\u7BA1",
    emoji: "\u{1F431}",
    category: "tech",
    description: "GitHub\u3001GitLab\u3001Bitbucket",
    groupType: "select",
    rules: [
      { id: "github", name: "GitHub", behavior: "domain", path: "geosite/github.mrs" },
      { id: "gitlab", name: "GitLab", behavior: "domain", path: "geosite/gitlab.mrs" },
      { id: "atlassian", name: "Atlassian / Bitbucket", behavior: "domain", path: "geosite/atlassian.mrs" }
    ]
  },
  {
    id: "cloud",
    name: "\u2601\uFE0F \u4E91\u670D\u52A1",
    emoji: "\u2601\uFE0F",
    category: "tech",
    description: "AWS\u3001Azure\u3001Cloudflare \u7B49",
    groupType: "select",
    rules: [
      { id: "aws", name: "AWS", behavior: "domain", path: "geosite/aws.mrs" },
      { id: "azure", name: "Azure", behavior: "domain", path: "geosite/azure.mrs" },
      { id: "cloudflare", name: "Cloudflare", behavior: "domain", path: "geosite/cloudflare.mrs" },
      { id: "digitalocean", name: "DigitalOcean", behavior: "domain", path: "geosite/digitalocean.mrs" },
      { id: "vercel", name: "Vercel", behavior: "domain", path: "geosite/vercel.mrs" },
      { id: "netlify", name: "Netlify", behavior: "domain", path: "geosite/netlify.mrs" },
      { id: "cloudflare-ip", name: "Cloudflare IP", behavior: "ipcidr", path: "geoip/cloudflare.mrs", noResolve: true }
    ]
  },
  {
    id: "dev-tools",
    name: "\u{1F6E0}\uFE0F \u5F00\u53D1\u5DE5\u5177",
    emoji: "\u{1F6E0}\uFE0F",
    category: "tech",
    description: "Docker\u3001npm\u3001JetBrains",
    groupType: "select",
    rules: [
      { id: "docker", name: "Docker", behavior: "domain", path: "geosite/docker.mrs" },
      { id: "npmjs", name: "npmjs", behavior: "domain", path: "geosite/npmjs.mrs" },
      { id: "jetbrains", name: "JetBrains", behavior: "domain", path: "geosite/jetbrains.mrs" },
      { id: "stackexchange", name: "Stack Exchange", behavior: "domain", path: "geosite/stackexchange.mrs" }
    ]
  },
  {
    id: "storage",
    name: "\u{1F4BE} \u7F51\u76D8\u5B58\u50A8",
    emoji: "\u{1F4BE}",
    category: "tech",
    description: "Dropbox\u3001Box\u3001Notion \u7B49",
    groupType: "select",
    rules: [
      { id: "dropbox", name: "Dropbox", behavior: "domain", path: "geosite/dropbox.mrs" },
      { id: "notion", name: "Notion", behavior: "domain", path: "geosite/notion.mrs" }
    ]
  },
  // ==================== 金融服务 ====================
  {
    id: "payment",
    name: "\u{1F4B3} \u652F\u4ED8\u5E73\u53F0",
    emoji: "\u{1F4B3}",
    category: "finance",
    description: "PayPal\u3001Stripe\u3001Wise \u7B49",
    groupType: "select",
    rules: [
      { id: "paypal", name: "PayPal", behavior: "domain", path: "geosite/paypal.mrs" },
      { id: "stripe", name: "Stripe", behavior: "domain", path: "geosite/stripe.mrs" },
      { id: "wise", name: "Wise", behavior: "domain", path: "geosite/wise.mrs" }
    ]
  },
  {
    id: "crypto",
    name: "\u20BF \u52A0\u5BC6\u8D27\u5E01",
    emoji: "\u20BF",
    category: "finance",
    description: "Binance \u7B49",
    groupType: "select",
    rules: [
      { id: "binance", name: "Binance", behavior: "domain", path: "geosite/binance.mrs" }
    ]
  },
  // ==================== 其他服务 ====================
  {
    id: "google-scholar",
    name: "\u{1F393} \u8C37\u6B4C\u5B66\u672F",
    emoji: "\u{1F393}",
    category: "other",
    description: "Google Scholar \u5B66\u672F\u641C\u7D22",
    groupType: "select",
    rules: [
      { id: "google-scholar", name: "Google Scholar", behavior: "domain", path: "geosite/google-scholar.mrs" }
    ]
  },
  {
    id: "education",
    name: "\u{1F4DA} \u6559\u80B2\u5B66\u672F",
    emoji: "\u{1F4DA}",
    category: "other",
    description: "Coursera\u3001Udemy\u3001\u5B66\u672F\u8D44\u6E90\u7B49",
    groupType: "select",
    rules: [
      { id: "category-scholar-!cn", name: "\u5B66\u672F\u8D44\u6E90", behavior: "domain", path: "geosite/category-scholar-!cn.mrs" },
      { id: "coursera", name: "Coursera", behavior: "domain", path: "geosite/coursera.mrs" },
      { id: "udemy", name: "Udemy", behavior: "domain", path: "geosite/udemy.mrs" },
      { id: "edx", name: "edX", behavior: "domain", path: "geosite/edx.mrs" },
      { id: "khanacademy", name: "Khan Academy", behavior: "domain", path: "geosite/khanacademy.mrs" },
      { id: "wikimedia", name: "Wikimedia / Wikipedia", behavior: "domain", path: "geosite/wikimedia.mrs" }
    ]
  },
  {
    id: "news",
    name: "\u{1F4F0} \u65B0\u95FB\u8D44\u8BAF",
    emoji: "\u{1F4F0}",
    category: "other",
    description: "BBC\u3001CNN\u3001NYT\u3001Bloomberg \u7B49",
    groupType: "select",
    rules: [
      { id: "bbc", name: "BBC", behavior: "domain", path: "geosite/bbc.mrs" },
      { id: "cnn", name: "CNN", behavior: "domain", path: "geosite/cnn.mrs" },
      { id: "nytimes", name: "NYT", behavior: "domain", path: "geosite/nytimes.mrs" },
      { id: "wsj", name: "WSJ", behavior: "domain", path: "geosite/wsj.mrs" },
      { id: "bloomberg", name: "Bloomberg", behavior: "domain", path: "geosite/bloomberg.mrs" }
    ]
  },
  {
    id: "shopping",
    name: "\u{1F6D2} \u6D77\u6DD8\u8D2D\u7269",
    emoji: "\u{1F6D2}",
    category: "other",
    description: "Amazon\u3001eBay\u3001Shopify \u7B49",
    groupType: "select",
    rules: [
      { id: "amazon", name: "Amazon", behavior: "domain", path: "geosite/amazon.mrs" },
      { id: "ebay", name: "eBay", behavior: "domain", path: "geosite/ebay.mrs" }
    ]
  },
  {
    id: "adult",
    name: "\u{1F51E} \u6210\u4EBA\u5185\u5BB9",
    emoji: "\u{1F51E}",
    category: "other",
    description: "\u6210\u4EBA\u7F51\u7AD9\uFF08\u9ED8\u8BA4\u5173\u95ED\uFF09",
    groupType: "select",
    rules: [
      { id: "category-porn", name: "\u6210\u4EBA\u7F51\u7AD9", behavior: "domain", path: "geosite/category-porn.mrs" }
    ]
  }
];

// src/rules/custom-rule-utils.ts
var CUSTOM_RULE_TYPES = [
  "DOMAIN",
  "DOMAIN-SUFFIX",
  "DOMAIN-KEYWORD",
  "IP-CIDR",
  "IP-CIDR6",
  "GEOIP",
  "GEOSITE",
  "PROCESS-NAME",
  "DST-PORT",
  "SRC-PORT"
];
var customRuleTypeSet = new Set(CUSTOM_RULE_TYPES);
function getCustomRuleOrderKey(ruleId) {
  return `custom-rule:${ruleId}`;
}

// src/proxy-group-name.ts
function splitLeadingEmoji(raw) {
  const name = typeof raw === "string" ? raw.trim() : "";
  const separatorIndex = (() => {
    for (let i = 0; i < name.length; i += 1) {
      if (name[i].trim() === "") return i;
    }
    return -1;
  })();
  if (separatorIndex <= 0) return { emoji: "", label: name, hasEmojiPrefix: false };
  const first = name.slice(0, separatorIndex);
  const rest = name.slice(separatorIndex).trim();
  if (!rest) return { emoji: "", label: name, hasEmojiPrefix: false };
  if (/[A-Za-z0-9\u4e00-\u9fff]/.test(first)) {
    return { emoji: "", label: name, hasEmojiPrefix: false };
  }
  return { emoji: first, label: rest, hasEmojiPrefix: true };
}
function resolveProxyGroupModuleName(module2, override) {
  const raw = typeof override === "string" ? override.trim() : "";
  if (!raw) return module2.name;
  const parsed = splitLeadingEmoji(raw);
  if (parsed.hasEmojiPrefix) return raw;
  return `${module2.emoji} ${raw}`.trim();
}

// src/generator/module-rules.ts
function getModuleRuleOrderKey(moduleId, ruleId) {
  return `module:${moduleId}:${ruleId}`;
}

// src/generator/policy-targets.ts
var BUILTIN_POLICY_TARGETS = ["DIRECT", "REJECT"];
function normalizePolicyTarget(target) {
  return typeof target === "string" ? target.trim() : "";
}
function uniquePolicyTargets(targets) {
  const out = [];
  const seen = /* @__PURE__ */ new Set();
  for (const target of targets) {
    const normalized = normalizePolicyTarget(target);
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    out.push(normalized);
  }
  return out;
}
function createPolicyTargetResolver(options2) {
  const availableTargets = Array.isArray(options2?.availablePolicyTargets) ? new Set(uniquePolicyTargets(options2.availablePolicyTargets)) : null;
  const fallback = normalizePolicyTarget(options2?.fallbackPolicyTarget);
  return (target) => {
    const normalized = normalizePolicyTarget(target);
    if (!availableTargets) return normalized;
    if (normalized && availableTargets.has(normalized)) return normalized;
    if (fallback && availableTargets.has(fallback)) return fallback;
    return "DIRECT";
  };
}
function chooseFallbackPolicyTarget(candidates, availablePolicyTargets) {
  const availableTargets = new Set(uniquePolicyTargets(availablePolicyTargets));
  for (const candidate of candidates) {
    const normalized = normalizePolicyTarget(candidate);
    if (normalized && availableTargets.has(normalized)) return normalized;
  }
  return "DIRECT";
}
function withBuiltinPolicyTargets(targets) {
  return uniquePolicyTargets([...targets, ...BUILTIN_POLICY_TARGETS]);
}

// src/generator/rules.ts
var EXPERIMENTAL_CN_RULE = {
  id: "cn",
  name: "\u56FD\u5185\u57DF\u540D (\u5B8C\u6574)",
  behavior: "domain",
  path: "geosite/cn.mrs"
};
var RULE_ORDER = [
  "ad",
  "private",
  "gemini",
  "ai",
  "cn",
  "youtube",
  "google-scholar",
  "education",
  "cloud",
  "google",
  "telegram",
  "github",
  "microsoft",
  "apple",
  "twitter",
  "meta",
  "discord",
  "social-other",
  "netflix",
  "disney",
  "streaming-west",
  "streaming-asia",
  "steam",
  "gaming-pc",
  "gaming-console",
  "dev-tools",
  "storage",
  "payment",
  "crypto",
  "news",
  "shopping",
  "adult",
  "global"
];
function resolveModuleName(moduleId, overrides) {
  const mod = PROXY_GROUP_MODULES.find((m) => m.id === moduleId);
  if (!mod) return moduleId;
  return resolveProxyGroupModuleName(mod, overrides?.[moduleId]);
}
function resolveModuleNameFromModule(module2, overrides) {
  return resolveModuleName(module2.id, overrides);
}
function buildModuleNameMap(overrides) {
  return Object.fromEntries(
    PROXY_GROUP_MODULES.map((module2) => [module2.id, resolveModuleNameFromModule(module2, overrides)])
  );
}
function getEnabledCustomProxyGroups(customProxyGroups) {
  return customProxyGroups.filter((group) => group && group.enabled !== false);
}
function customTargetIsDisabled(target, customProxyGroups) {
  const disabled = customProxyGroups.filter((group) => group && group.enabled === false);
  if (disabled.length === 0) return false;
  if (typeof target === "object" && target?.kind === "custom") {
    return disabled.some((group) => group.id === target.id);
  }
  if (typeof target === "string") {
    const name = target.trim();
    return Boolean(name) && disabled.some((group) => group.name.trim() === name);
  }
  return false;
}
var PRESET_MODULE_RULE_ORDER_KEYS = PROXY_GROUP_MODULES.flatMap(
  (module2) => module2.rules.map((rule) => getModuleRuleOrderKey(module2.id, rule.id))
);
var PRESET_MODULE_RULE_ORDER_KEY_SET = new Set(PRESET_MODULE_RULE_ORDER_KEYS);
function buildModuleRuleEntry(module2, rule, builtinRuleEdits, proxyGroupNameOverrides, cnIpNoResolve, customProxyGroups = [], resolvePolicyTarget = (target) => target) {
  const key = getModuleRuleOrderKey(module2.id, rule.id);
  const edit = builtinRuleEdits?.[key];
  const defaultTarget = resolveModuleNameFromModule(module2, proxyGroupNameOverrides);
  const moduleNames = buildModuleNameMap(proxyGroupNameOverrides);
  const targetName = resolveProxyGroupTargetName(edit?.target || defaultTarget, {
    moduleNames,
    customProxyGroups,
    fallbackTarget: defaultTarget
  });
  const target = resolvePolicyTarget(targetName);
  const noResolve = module2.id === "cn" && rule.id === "cn-ip" && typeof cnIpNoResolve === "boolean" ? cnIpNoResolve : Boolean(rule.noResolve);
  let text = `RULE-SET,${rule.id},${target}`;
  if (noResolve) text += ",no-resolve";
  return {
    key,
    text,
    kind: "module",
    sourceLabel: defaultTarget,
    summary: rule.name,
    target,
    noResolve,
    editable: false,
    enabled: edit?.enabled !== false
  };
}
function buildCustomRuleEntry(rule, moduleNames, customProxyGroups = [], resolvePolicyTarget = (target) => target) {
  const noResolve = Boolean(rule.noResolve) && (rule.type === "IP-CIDR" || rule.type === "IP-CIDR6");
  const target = resolvePolicyTarget(resolveProxyGroupTargetName(rule.target, { moduleNames, customProxyGroups }));
  let text = `${rule.type},${rule.value},${target}`;
  if (noResolve) text += ",no-resolve";
  return {
    key: getCustomRuleOrderKey(rule.id),
    text,
    kind: "custom-rule",
    sourceLabel: "\u81EA\u5B9A\u4E49\u89C4\u5219",
    summary: rule.value,
    target,
    noResolve,
    editable: true,
    enabled: true
  };
}
function buildCustomRuleSetEntry(ruleSet, moduleNames, customProxyGroups = [], resolvePolicyTarget = (target) => target) {
  const noResolve = Boolean(ruleSet.noResolve);
  const target = resolvePolicyTarget(resolveProxyGroupTargetName(ruleSet.target, { moduleNames, customProxyGroups }));
  let text = `RULE-SET,${ruleSet.id},${target}`;
  if (noResolve) text += ",no-resolve";
  return {
    key: getCustomRuleSetOrderKey(ruleSet.id),
    text,
    kind: "custom-rule-set",
    sourceLabel: "\u81EA\u5B9A\u4E49\u89C4\u5219\u96C6",
    summary: ruleSet.name,
    target,
    noResolve,
    editable: true,
    enabled: true
  };
}
function buildOrderedEditableEntries(customRules, customRuleSets, ruleOrder, moduleNames = {}, customProxyGroups = [], resolvePolicyTarget = (target) => target) {
  const defaultEntries = [
    ...customRules.map((rule) => buildCustomRuleEntry(rule, moduleNames, customProxyGroups, resolvePolicyTarget)),
    ...customRuleSets.map((ruleSet) => buildCustomRuleSetEntry(ruleSet, moduleNames, customProxyGroups, resolvePolicyTarget))
  ];
  const editableKeys = defaultEntries.map((entry) => entry.key);
  const normalizedEditableOrder = normalizeEditableRuleOrderKeys(ruleOrder, editableKeys);
  const byKey = new Map(defaultEntries.map((entry) => [entry.key, entry]));
  return normalizedEditableOrder.map((key) => byKey.get(key)).filter(Boolean);
}
function buildSpecialRuleEntry(key, text, summary, target) {
  return {
    key,
    text,
    kind: "special",
    sourceLabel: "\u7CFB\u7EDF\u89C4\u5219",
    summary,
    target,
    noResolve: false,
    editable: false,
    enabled: true
  };
}
function getCustomRuleSetOrderKey(ruleSetId) {
  return `custom-rule-set:${ruleSetId}`;
}
function normalizeRuleOrderInput(ruleOrder) {
  if (!Array.isArray(ruleOrder)) return [];
  const next = [];
  const seen = /* @__PURE__ */ new Set();
  for (const rawKey of ruleOrder) {
    const key = typeof rawKey === "string" ? rawKey.trim() : "";
    if (!key || seen.has(key)) continue;
    seen.add(key);
    next.push(key);
  }
  return next;
}
function normalizeEditableRuleOrderKeys(ruleOrder, editableRuleKeys) {
  if (editableRuleKeys.length === 0) return [];
  const editableSet = new Set(editableRuleKeys);
  const cleaned = normalizeRuleOrderInput(ruleOrder);
  const next = [];
  const used = /* @__PURE__ */ new Set();
  for (const key of cleaned) {
    if (!editableSet.has(key) || used.has(key)) continue;
    used.add(key);
    next.push(key);
  }
  for (const key of editableRuleKeys) {
    if (used.has(key)) continue;
    used.add(key);
    next.push(key);
  }
  return next;
}
function normalizeFullRuleOrderKeys(ruleOrder, allRuleKeys) {
  const allSet = new Set(allRuleKeys);
  return normalizeRuleOrderInput(ruleOrder).filter(
    (key) => allSet.has(key) || PRESET_MODULE_RULE_ORDER_KEY_SET.has(key)
  );
}
function applyEditableOnlyOrder(editableRuleKeys, allRuleKeys, editableOrder) {
  const editableSet = new Set(editableRuleKeys);
  let editableIndex = 0;
  return allRuleKeys.map((key) => {
    if (!editableSet.has(key)) return key;
    const nextKey = editableOrder[editableIndex];
    editableIndex += 1;
    return nextKey ?? key;
  });
}
function getLegacyEditableRuleKeys(entries) {
  return entries.filter((entry) => entry.kind === "custom-rule" || entry.kind === "custom-rule-set").map((entry) => entry.key);
}
function usesFullRuleOrder(ruleOrder, editableRuleKeys, allRuleKeys) {
  const allSet = /* @__PURE__ */ new Set([...allRuleKeys, ...PRESET_MODULE_RULE_ORDER_KEYS]);
  const editableSet = new Set(editableRuleKeys);
  return normalizeRuleOrderInput(ruleOrder).some((key) => allSet.has(key) && !editableSet.has(key));
}
function getRuleIdFromModuleRuleOrderKey(key) {
  const parts = key.split(":");
  if (parts.length !== 3 || parts[0] !== "module") return null;
  return parts[2] || null;
}
function insertMovedModuleRuleAtSourceAnchor(orderedKeys, activeRuleKeys, key) {
  const ruleId = getRuleIdFromModuleRuleOrderKey(key);
  if (!ruleId) return false;
  const anchorIndex = orderedKeys.findIndex((candidate) => {
    if (activeRuleKeys.has(candidate)) return false;
    if (!PRESET_MODULE_RULE_ORDER_KEY_SET.has(candidate)) return false;
    return getRuleIdFromModuleRuleOrderKey(candidate) === ruleId;
  });
  if (anchorIndex < 0) return false;
  orderedKeys.splice(anchorIndex, 0, key);
  return true;
}
function buildCanonicalRuleEntries(options2) {
  const {
    enabledModules,
    customRules,
    customRuleSets = [],
    customProxyGroups = [],
    builtinRuleEdits,
    proxyGroupNameOverrides,
    experimentalCnUseCnRuleSet,
    cnIpNoResolve,
    availablePolicyTargets,
    fallbackPolicyTarget
  } = options2;
  const entries = [];
  const enabledSet = new Set(enabledModules);
  const moduleNames = buildModuleNameMap(proxyGroupNameOverrides);
  const activeCustomProxyGroups = getEnabledCustomProxyGroups(customProxyGroups);
  const resolvePolicyTarget = createPolicyTargetResolver({ availablePolicyTargets, fallbackPolicyTarget });
  const editableEntries = buildOrderedEditableEntries(
    customRules.filter((rule) => !customTargetIsDisabled(rule.target, customProxyGroups)),
    customRuleSets.filter((ruleSet) => !customTargetIsDisabled(ruleSet.target, customProxyGroups)),
    void 0,
    moduleNames,
    activeCustomProxyGroups,
    resolvePolicyTarget
  );
  const emittedRuleKeys = /* @__PURE__ */ new Set();
  let insertedEditableEntries = false;
  const pushEditableEntries = () => {
    if (insertedEditableEntries || editableEntries.length === 0) return;
    insertedEditableEntries = true;
    entries.push(...editableEntries);
  };
  const pushModuleRuleEntry = (module2, rule) => {
    const entry = buildModuleRuleEntry(
      module2,
      rule,
      builtinRuleEdits,
      proxyGroupNameOverrides,
      cnIpNoResolve,
      activeCustomProxyGroups,
      resolvePolicyTarget
    );
    if (emittedRuleKeys.has(entry.key)) return;
    emittedRuleKeys.add(entry.key);
    entries.push(entry);
  };
  const pushAppleTvPlusAtCanonicalPosition = () => {
    if (!enabledSet.has("streaming-west")) return;
    const streamingWestModule = PROXY_GROUP_MODULES.find((item) => item.id === "streaming-west");
    if (!streamingWestModule) return;
    const appleTvPlusRule = streamingWestModule.rules.find((rule) => rule.id === "apple-tvplus");
    if (!appleTvPlusRule) return;
    pushModuleRuleEntry(streamingWestModule, appleTvPlusRule);
  };
  const processedModules = /* @__PURE__ */ new Set();
  for (const moduleId of RULE_ORDER) {
    if (!insertedEditableEntries && moduleId === "gemini") {
      pushEditableEntries();
    }
    if (moduleId === "apple") {
      pushAppleTvPlusAtCanonicalPosition();
    }
    if (!enabledSet.has(moduleId)) continue;
    processedModules.add(moduleId);
    const ruleModule = PROXY_GROUP_MODULES.find((item) => item.id === moduleId);
    if (!ruleModule) continue;
    for (const rule of ruleModule.rules) {
      pushModuleRuleEntry(ruleModule, rule);
    }
  }
  for (const ruleModule of PROXY_GROUP_MODULES) {
    if (!enabledSet.has(ruleModule.id)) continue;
    if (processedModules.has(ruleModule.id)) continue;
    if (ruleModule.id === "final") continue;
    for (const rule of ruleModule.rules) {
      pushModuleRuleEntry(ruleModule, rule);
    }
  }
  pushEditableEntries();
  if (Boolean(experimentalCnUseCnRuleSet) && enabledSet.has("cn")) {
    const target = resolvePolicyTarget(resolveModuleName("cn", proxyGroupNameOverrides));
    entries.push(
      buildSpecialRuleEntry("special:experimental-cn", `RULE-SET,${EXPERIMENTAL_CN_RULE.id},${target}`, EXPERIMENTAL_CN_RULE.name, target)
    );
  }
  const finalTarget = resolvePolicyTarget(
    enabledSet.has("final") ? resolveModuleName("final", proxyGroupNameOverrides) : fallbackPolicyTarget ?? resolveModuleName("select", proxyGroupNameOverrides)
  );
  return {
    preMatchEntries: entries,
    matchEntry: buildSpecialRuleEntry("special:match", `MATCH,${finalTarget}`, "MATCH", finalTarget)
  };
}
function normalizePersistedRuleOrder(options2) {
  const { preMatchEntries } = buildCanonicalRuleEntries({
    enabledModules: options2.enabledModules,
    customRules: options2.customRules,
    customRuleSets: options2.customRuleSets,
    customProxyGroups: options2.customProxyGroups,
    builtinRuleEdits: options2.builtinRuleEdits,
    proxyGroupNameOverrides: options2.proxyGroupNameOverrides,
    experimentalCnUseCnRuleSet: options2.experimentalCnUseCnRuleSet,
    cnIpNoResolve: options2.cnIpNoResolve,
    availablePolicyTargets: options2.availablePolicyTargets,
    fallbackPolicyTarget: options2.fallbackPolicyTarget
  });
  const allRuleKeys = preMatchEntries.map((entry) => entry.key);
  const editableRuleKeys = getLegacyEditableRuleKeys(preMatchEntries);
  const cleaned = normalizeRuleOrderInput(options2.ruleOrder);
  if (cleaned.length === 0) return [];
  if (usesFullRuleOrder(cleaned, editableRuleKeys, allRuleKeys)) {
    return normalizeFullRuleOrderKeys(cleaned, allRuleKeys);
  }
  return normalizeEditableRuleOrderKeys(cleaned, editableRuleKeys);
}
function resolveAppliedRuleOrder(options2) {
  const { preMatchEntries } = buildCanonicalRuleEntries({
    enabledModules: options2.enabledModules,
    customRules: options2.customRules,
    customRuleSets: options2.customRuleSets,
    customProxyGroups: options2.customProxyGroups,
    builtinRuleEdits: options2.builtinRuleEdits,
    proxyGroupNameOverrides: options2.proxyGroupNameOverrides,
    experimentalCnUseCnRuleSet: options2.experimentalCnUseCnRuleSet,
    cnIpNoResolve: options2.cnIpNoResolve,
    availablePolicyTargets: options2.availablePolicyTargets,
    fallbackPolicyTarget: options2.fallbackPolicyTarget
  });
  const allRuleKeys = preMatchEntries.map((entry) => entry.key);
  const activeRuleKeys = preMatchEntries.filter((entry) => entry.enabled !== false).map((entry) => entry.key);
  const editableRuleKeys = getLegacyEditableRuleKeys(preMatchEntries);
  const persistedOrder = normalizePersistedRuleOrder(options2);
  if (persistedOrder.length === 0) {
    return activeRuleKeys;
  }
  if (usesFullRuleOrder(persistedOrder, editableRuleKeys, allRuleKeys)) {
    const activeRuleKeySet = new Set(activeRuleKeys);
    const next = persistedOrder.filter(
      (key) => activeRuleKeySet.has(key) || PRESET_MODULE_RULE_ORDER_KEY_SET.has(key)
    );
    const seen = new Set(next.filter((key) => activeRuleKeySet.has(key)));
    const editableSet = new Set(editableRuleKeys);
    const missingEditableKeys = editableRuleKeys.filter((key) => !seen.has(key));
    if (missingEditableKeys.length > 0) {
      const firstEditableIndex = allRuleKeys.findIndex((key) => editableSet.has(key));
      let inserted = false;
      for (let prevIndex = firstEditableIndex - 1; prevIndex >= 0; prevIndex -= 1) {
        const prevKey = allRuleKeys[prevIndex];
        const resultIndex = next.indexOf(prevKey);
        if (resultIndex < 0) continue;
        next.splice(resultIndex + 1, 0, ...missingEditableKeys);
        missingEditableKeys.forEach((key) => seen.add(key));
        inserted = true;
        break;
      }
      if (!inserted) {
        for (let nextIndex = firstEditableIndex + missingEditableKeys.length; nextIndex < allRuleKeys.length; nextIndex += 1) {
          const nextKey = allRuleKeys[nextIndex];
          const resultIndex = next.indexOf(nextKey);
          if (resultIndex < 0) continue;
          next.splice(resultIndex, 0, ...missingEditableKeys);
          missingEditableKeys.forEach((key) => seen.add(key));
          inserted = true;
          break;
        }
      }
      if (!inserted) {
        next.push(...missingEditableKeys);
        missingEditableKeys.forEach((key) => seen.add(key));
      }
    }
    for (const key of allRuleKeys) {
      if (seen.has(key)) continue;
      if (insertMovedModuleRuleAtSourceAnchor(next, activeRuleKeySet, key)) {
        seen.add(key);
        continue;
      }
      next.push(key);
      seen.add(key);
    }
    return next.filter((key) => activeRuleKeySet.has(key));
  }
  return applyEditableOnlyOrder(
    editableRuleKeys,
    allRuleKeys,
    normalizeEditableRuleOrderKeys(persistedOrder, editableRuleKeys)
  ).filter((key) => activeRuleKeys.includes(key));
}
function buildGeneratedRuleEntries(options2) {
  const { preMatchEntries, matchEntry } = buildCanonicalRuleEntries({
    enabledModules: options2.enabledModules,
    customRules: options2.customRules,
    customRuleSets: options2.customRuleSets,
    customProxyGroups: options2.customProxyGroups,
    builtinRuleEdits: options2.builtinRuleEdits,
    proxyGroupNameOverrides: options2.proxyGroupNameOverrides,
    experimentalCnUseCnRuleSet: options2.experimentalCnUseCnRuleSet,
    cnIpNoResolve: options2.cnIpNoResolve,
    availablePolicyTargets: options2.availablePolicyTargets,
    fallbackPolicyTarget: options2.fallbackPolicyTarget
  });
  const orderKeys = resolveAppliedRuleOrder(options2);
  const byKey = new Map(preMatchEntries.map((entry) => [entry.key, entry]));
  const orderedEntries = orderKeys.map((key) => byKey.get(key)).filter((entry) => Boolean(entry?.enabled));
  return [...orderedEntries, matchEntry];
}
function generateRules(options2) {
  return buildGeneratedRuleEntries(options2).map((entry) => entry.text);
}

// src/rules/rule-model.ts
function trimLeadingSlashes(value) {
  let index = 0;
  while (index < value.length && value.charCodeAt(index) === 47) index += 1;
  return value.slice(index);
}
function trimTrailingSlashes(value) {
  let end = value.length;
  while (end > 0 && value.charCodeAt(end - 1) === 47) end -= 1;
  return value.slice(0, end);
}
function extractRuleSetPathFromUrl(url) {
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const match = trimmed.match(/^(?:\/+)?(geosite|geoip)\/[^/?#\s]+\.mrs$/i);
  if (!match) return trimmed;
  return trimLeadingSlashes(match[0]);
}
function normalizeRuleSetPathInput(input) {
  return trimLeadingSlashes(extractRuleSetPathFromUrl(input)).trim();
}
function buildRuleSetUrlFromPath(path, baseUrl) {
  const normalizedPath = normalizeRuleSetPathInput(path);
  if (/^https?:\/\//i.test(normalizedPath)) return normalizedPath;
  return `${trimTrailingSlashes(baseUrl)}/${normalizedPath}`;
}

// src/generator/proxy-group-type.ts
function uniqueProxyNames(values) {
  const out = [];
  const seen = /* @__PURE__ */ new Set();
  for (const value of values) {
    if (!value || seen.has(value)) continue;
    seen.add(value);
    out.push(value);
  }
  return out;
}
function buildTypedProxyGroup({
  name,
  groupType,
  proxies,
  testUrl,
  testInterval,
  strategy,
  extraFields = {},
  urlTestLazy = false
}) {
  const base = {
    name,
    type: "select",
    proxies,
    ...extraFields
  };
  switch (groupType) {
    case "url-test":
      return {
        ...base,
        type: "url-test",
        url: testUrl,
        interval: testInterval,
        lazy: urlTestLazy
      };
    case "fallback":
      return {
        ...base,
        type: "fallback",
        url: testUrl,
        interval: testInterval
      };
    case "load-balance":
      return {
        ...base,
        type: "load-balance",
        url: testUrl,
        interval: testInterval,
        strategy: strategy ?? DEFAULT_LOAD_BALANCE_STRATEGY
      };
    case "direct-first":
    case "reject-first":
    case "select":
    default:
      return base;
  }
}

// src/generator/proxy-groups.ts
function getEnabledCustomProxyGroups2(customProxyGroups) {
  return customProxyGroups.filter((group) => group && group.enabled !== false);
}
function usesFilteredNodeMembers(group) {
  return group.memberSource === "filtered-nodes";
}
function isIncludedInGroupMembers(group) {
  return group.includeInGroupMembers === true;
}
function customTargetIsDisabled2(target, customProxyGroups) {
  const disabled = customProxyGroups.filter((group) => group && group.enabled === false);
  if (disabled.length === 0) return false;
  if (typeof target === "object" && target?.kind === "custom") {
    return disabled.some((group) => group.id === target.id);
  }
  if (typeof target === "string") {
    const name = target.trim();
    return Boolean(name) && disabled.some((group) => group.name.trim() === name);
  }
  return false;
}
var PROXY_GROUP_ORDER = [
  // 1. 核心选择组（最前面）
  "select",
  "auto",
  // 2. 广告拦截
  "ad",
  // 3. 常用服务
  "ai",
  "gemini",
  "youtube",
  "google",
  "microsoft",
  "apple",
  // 4. 社交通讯
  "telegram",
  "twitter",
  "meta",
  "discord",
  "social-other",
  // 5. 流媒体
  "netflix",
  "disney",
  "streaming-west",
  "streaming-asia",
  // 6. 游戏平台
  "steam",
  "gaming-pc",
  "gaming-console",
  // 7. 技术服务
  "github",
  "cloud",
  "dev-tools",
  "storage",
  // 8. 金融服务
  "payment",
  "crypto",
  // 9. 其他
  "google-scholar",
  "education",
  "news",
  "shopping",
  "adult",
  // 10. 直连组（靠后）
  "private",
  "cn",
  // 11. 兜底组（最后）
  "global",
  "final"
];
function generateProxyGroups(options2) {
  const {
    nodes,
    proxyProviderNames = [],
    enabledModules,
    testUrl,
    testInterval,
    customProxyGroups = [],
    proxyGroupAdvanced = {},
    proxyGroupNameOverrides
  } = options2;
  const activeCustomProxyGroups = getEnabledCustomProxyGroups2(customProxyGroups);
  const providerUse = proxyProviderNames.length > 0 ? { use: proxyProviderNames } : {};
  const nodeNames = nodes.map((n) => n.name);
  const filteredNodeNames = nodeNames.filter((n) => !isSubscriptionInfoNodeName(n));
  const groups = [];
  const processedModules = /* @__PURE__ */ new Set();
  const leadingCustomProxyGroups = activeCustomProxyGroups.filter(usesFilteredNodeMembers);
  const inlineCustomProxyGroups = activeCustomProxyGroups.filter((group) => !usesFilteredNodeMembers(group));
  const enabledSet = new Set(enabledModules);
  const enabledModuleTarget = (moduleId) => enabledSet.has(moduleId) ? resolveModuleName(moduleId, proxyGroupNameOverrides) : null;
  const moduleNames = Object.fromEntries(
    PROXY_GROUP_MODULES.map((module2) => [
      module2.id,
      resolveModuleNameFromModule(module2, proxyGroupNameOverrides)
    ])
  );
  const customGroupNames = activeCustomProxyGroups.filter(isIncludedInGroupMembers).map((group) => typeof group.name === "string" ? group.name.trim() : "").filter(Boolean);
  const policyTargets = (...targets) => {
    const out = [];
    const seen = /* @__PURE__ */ new Set();
    for (const target of targets) {
      if (typeof target !== "string" || !target || seen.has(target)) continue;
      seen.add(target);
      out.push(target);
    }
    return out;
  };
  const fallbackTargets = (...targets) => policyTargets(...targets, "DIRECT", "REJECT");
  const selectTarget = enabledModuleTarget("select");
  const autoTarget = enabledModuleTarget("auto");
  const moduleBaseProxies = selectTarget ? fallbackTargets(
    selectTarget,
    autoTarget,
    "DIRECT",
    "REJECT",
    ...customGroupNames,
    ...filteredNodeNames
  ) : fallbackTargets(
    autoTarget,
    ...customGroupNames,
    ...filteredNodeNames,
    "DIRECT",
    "REJECT"
  );
  const customBaseProxies = fallbackTargets("DIRECT", "REJECT", ...filteredNodeNames);
  const availableMemberProxyNames = fallbackTargets(
    "DIRECT",
    "REJECT",
    autoTarget,
    selectTarget,
    ...filteredNodeNames,
    ...PROXY_GROUP_MODULES.filter((module2) => enabledSet.has(module2.id)).map((module2) => moduleNames[module2.id]),
    ...customGroupNames
  );
  const resolveGroupProxyNames = (defaultProxyNames, advanced, self) => resolveProxyGroupMembers({
    defaultProxyNames,
    availableProxyNames: availableMemberProxyNames,
    nodes,
    moduleNames,
    customProxyGroups: activeCustomProxyGroups,
    advanced,
    self
  }).proxyNames;
  const createGeneratedProxyGroup = (name, groupType, proxies, strategy, extraFields = providerUse, groupTestUrl) => buildTypedProxyGroup({
    name,
    groupType,
    proxies,
    testUrl: groupType === "url-test" ? groupTestUrl || testUrl : testUrl,
    testInterval,
    strategy,
    extraFields,
    urlTestLazy: false
  });
  const generateGroup = (module2) => {
    const moduleName = resolveModuleNameFromModule(module2, proxyGroupNameOverrides);
    const advanced = proxyGroupAdvanced[module2.id];
    const groupType = advanced?.groupType ?? module2.groupType;
    switch (groupType) {
      case "select":
        if (module2.id === "select") {
          const defaultProxies = fallbackTargets(
            autoTarget,
            "DIRECT",
            "REJECT",
            ...nodeNames
          );
          groups.push({
            name: moduleName,
            type: "select",
            // “节点选择”组本身不应包含自己；默认先走“⚡ 自动选择”更符合开箱即用
            proxies: resolveGroupProxyNames(defaultProxies, advanced, {
              kind: "module",
              id: module2.id,
              name: moduleName
            }),
            ...providerUse
          });
        } else {
          const defaultProxies = moduleBaseProxies.filter((target) => target !== moduleName);
          groups.push({
            name: moduleName,
            type: "select",
            proxies: resolveGroupProxyNames(defaultProxies, advanced, {
              kind: "module",
              id: module2.id,
              name: moduleName
            }),
            ...providerUse
          });
        }
        break;
      case "url-test":
        groups.push(createGeneratedProxyGroup(
          moduleName,
          groupType,
          resolveGroupProxyNames(filteredNodeNames, advanced, {
            kind: "module",
            id: module2.id,
            name: moduleName
          }),
          void 0,
          providerUse,
          advanced?.testUrl
        ));
        break;
      case "fallback":
        groups.push(createGeneratedProxyGroup(
          moduleName,
          groupType,
          resolveGroupProxyNames(filteredNodeNames, advanced, {
            kind: "module",
            id: module2.id,
            name: moduleName
          })
        ));
        break;
      case "load-balance":
        groups.push(createGeneratedProxyGroup(
          moduleName,
          groupType,
          resolveGroupProxyNames(filteredNodeNames, advanced, {
            kind: "module",
            id: module2.id,
            name: moduleName
          }),
          advanced?.strategy ?? DEFAULT_LOAD_BALANCE_STRATEGY
        ));
        break;
      case "reject-first":
        {
          const defaultProxies = fallbackTargets("REJECT", "DIRECT", selectTarget).filter((target) => target !== moduleName);
          groups.push({
            name: moduleName,
            type: "select",
            proxies: resolveGroupProxyNames(defaultProxies, advanced, {
              kind: "module",
              id: module2.id,
              name: moduleName
            }),
            ...providerUse
          });
        }
        break;
      case "direct-first":
        {
          const defaultProxies = fallbackTargets(
            "DIRECT",
            "REJECT",
            ...customGroupNames,
            selectTarget,
            autoTarget,
            ...filteredNodeNames
          ).filter((target) => target !== moduleName);
          groups.push({
            name: moduleName,
            type: "select",
            // 私有网络/国内服务：默认 DIRECT，但也提供自动选择
            proxies: resolveGroupProxyNames(defaultProxies, advanced, {
              kind: "module",
              id: module2.id,
              name: moduleName
            }),
            ...providerUse
          });
        }
        break;
    }
  };
  const createCustomProxyGroup = (customGroup) => {
    const resolveCustom = (defaultProxyNames) => resolveGroupProxyNames(defaultProxyNames, customGroup.advanced, {
      kind: "custom",
      id: customGroup.id,
      name: customGroup.name
    });
    if (usesFilteredNodeMembers(customGroup)) {
      if (customGroup.groupType === "url-test" || customGroup.groupType === "fallback") {
        return createGeneratedProxyGroup(customGroup.name, customGroup.groupType, resolveCustom(filteredNodeNames), void 0, {}, customGroup.advanced?.testUrl);
      }
      if (customGroup.groupType === "load-balance") {
        return createGeneratedProxyGroup(
          customGroup.name,
          customGroup.groupType,
          resolveCustom(filteredNodeNames),
          customGroup.strategy ?? DEFAULT_LOAD_BALANCE_STRATEGY,
          {}
        );
      }
      return {
        name: customGroup.name,
        type: "select",
        proxies: customGroup.groupType === "reject-first" ? resolveCustom(["REJECT", "DIRECT", ...filteredNodeNames]) : resolveCustom(["DIRECT", "REJECT", ...filteredNodeNames])
      };
    }
    if (customGroup.groupType === "url-test") {
      return createGeneratedProxyGroup(customGroup.name, customGroup.groupType, resolveCustom(filteredNodeNames), void 0, providerUse, customGroup.advanced?.testUrl);
    }
    if (customGroup.groupType === "fallback") {
      return createGeneratedProxyGroup(customGroup.name, customGroup.groupType, resolveCustom(filteredNodeNames));
    }
    if (customGroup.groupType === "load-balance") {
      return createGeneratedProxyGroup(
        customGroup.name,
        customGroup.groupType,
        resolveCustom(filteredNodeNames),
        customGroup.strategy ?? DEFAULT_LOAD_BALANCE_STRATEGY
      );
    }
    if (customGroup.groupType === "direct-first") {
      return {
        name: customGroup.name,
        type: "select",
        proxies: resolveCustom(
          fallbackTargets("DIRECT", "REJECT", ...filteredNodeNames).filter(
            (target) => target !== customGroup.name
          )
        ),
        ...providerUse
      };
    }
    if (customGroup.groupType === "reject-first") {
      return {
        name: customGroup.name,
        type: "select",
        proxies: resolveCustom(
          fallbackTargets("REJECT", "DIRECT", ...filteredNodeNames).filter(
            (target) => target !== customGroup.name
          )
        ),
        ...providerUse
      };
    }
    return {
      name: customGroup.name,
      type: "select",
      proxies: resolveCustom(customBaseProxies.filter((target) => target !== customGroup.name)),
      ...providerUse
    };
  };
  for (const customGroup of leadingCustomProxyGroups) {
    groups.push(createCustomProxyGroup(customGroup));
  }
  let insertedCustom = false;
  for (const moduleId of PROXY_GROUP_ORDER) {
    if (!insertedCustom && moduleId === "ai" && inlineCustomProxyGroups.length > 0) {
      insertedCustom = true;
      for (const customGroup of inlineCustomProxyGroups) {
        groups.push(createCustomProxyGroup(customGroup));
      }
    }
    if (!enabledSet.has(moduleId)) continue;
    const proxyModule = PROXY_GROUP_MODULES.find((m) => m.id === moduleId);
    if (!proxyModule) continue;
    processedModules.add(moduleId);
    generateGroup(proxyModule);
  }
  for (const proxyModule of PROXY_GROUP_MODULES) {
    if (!enabledSet.has(proxyModule.id)) continue;
    if (processedModules.has(proxyModule.id)) continue;
    generateGroup(proxyModule);
  }
  if (!insertedCustom && inlineCustomProxyGroups.length > 0) {
    for (const customGroup of inlineCustomProxyGroups) {
      groups.push(createCustomProxyGroup(customGroup));
    }
  }
  return groups;
}
function generateRuleProviders(options2) {
  const {
    enabledModules,
    ruleProviderBaseUrl,
    customRuleSets = [],
    builtinRuleEdits,
    customProxyGroups = []
  } = options2;
  const providers = {};
  const enabledSet = new Set(enabledModules);
  for (const proxyModule of PROXY_GROUP_MODULES) {
    if (!enabledSet.has(proxyModule.id)) continue;
    for (const rule of proxyModule.rules) {
      const edit = builtinRuleEdits?.[getModuleRuleOrderKey(proxyModule.id, rule.id)];
      if (edit?.enabled === false) continue;
      providers[rule.id] = {
        type: "http",
        behavior: rule.behavior,
        url: `${ruleProviderBaseUrl}/${rule.path}`,
        path: `./ruleset/${rule.id}.mrs`,
        interval: 86400,
        format: "mrs"
      };
    }
  }
  if (options2.experimentalCnUseCnRuleSet && enabledSet.has("cn") && !providers[EXPERIMENTAL_CN_RULE.id]) {
    providers[EXPERIMENTAL_CN_RULE.id] = {
      type: "http",
      behavior: EXPERIMENTAL_CN_RULE.behavior,
      url: `${ruleProviderBaseUrl}/${EXPERIMENTAL_CN_RULE.path}`,
      path: `./ruleset/${EXPERIMENTAL_CN_RULE.id}.mrs`,
      interval: 86400,
      format: "mrs"
    };
  }
  for (const ruleSet of customRuleSets) {
    if (customTargetIsDisabled2(ruleSet.target, customProxyGroups)) continue;
    if (!ruleSet?.id || !ruleSet.path || providers[ruleSet.id]) continue;
    providers[ruleSet.id] = {
      type: "http",
      behavior: ruleSet.behavior,
      url: buildRuleSetUrlFromPath(ruleSet.path, ruleProviderBaseUrl),
      path: `./ruleset/${ruleSet.id}.mrs`,
      interval: 86400,
      format: "mrs"
    };
  }
  return providers;
}
function getModulesForTemplate(template) {
  switch (template) {
    case "minimal":
      return ["select", "auto", "ad", "private", "cn", "global", "final"];
    case "standard":
      return ["select", "auto", "ad", "private", "cn", "global", "ai", "youtube", "google", "microsoft", "apple", "github", "telegram", "final"];
    case "full":
    default:
      return PROXY_GROUP_MODULES.filter((m) => m.id !== "adult" && m.id !== "gemini" && m.id !== "google-scholar").map((m) => m.id);
  }
}

// src/templates/index.ts
var MINIMAL_TEMPLATE = {
  id: "minimal",
  name: "\u7CBE\u7B80\u7248",
  description: "\u57FA\u7840\u4EE3\u7406\u7EC4 + \u56FD\u5185\u5916\u5206\u6D41\uFF0C\u9002\u5408\u8F7B\u5EA6\u7528\u6237",
  groups: getModulesForTemplate("minimal"),
  rules: getModulesForTemplate("minimal"),
  // 使用同样的模块列表
  dns: {}
};
var STANDARD_TEMPLATE = {
  id: "standard",
  name: "\u6807\u51C6\u7248",
  description: "\u5B8C\u6574\u4EE3\u7406\u7EC4 + \u5E38\u7528\u89C4\u5219\uFF0C\u6EE1\u8DB3\u5927\u90E8\u5206\u9700\u6C42",
  groups: getModulesForTemplate("standard"),
  rules: getModulesForTemplate("standard"),
  dns: {}
};
var FULL_TEMPLATE = {
  id: "full",
  name: "\u5B8C\u6574\u7248",
  description: "\u5168\u90E8\u529F\u80FD + \u6269\u5C55\u89C4\u5219\u96C6\uFF0C\u9002\u5408\u9AD8\u7EA7\u7528\u6237",
  groups: getModulesForTemplate("full"),
  rules: getModulesForTemplate("full"),
  dns: {}
};
var TEMPLATES = {
  minimal: MINIMAL_TEMPLATE,
  standard: STANDARD_TEMPLATE,
  full: FULL_TEMPLATE
};
function getTemplateList() {
  return Object.values(TEMPLATES).map((t) => {
    const ruleCount = t.groups.reduce((acc, groupId) => {
      const proxyMod = PROXY_GROUP_MODULES.find((m) => m.id === groupId);
      return acc + (proxyMod?.rules.length || 0);
    }, 0);
    return {
      id: t.id,
      name: t.name,
      description: t.description,
      groupCount: t.groups.length,
      ruleCount
    };
  });
}
function getTemplate(id) {
  return TEMPLATES[id] || TEMPLATES.standard;
}
function validateTemplateConfig(config) {
  const errors = [];
  if (!config.name || config.name.trim() === "") {
    errors.push("\u6A21\u677F\u540D\u79F0\u4E0D\u80FD\u4E3A\u7A7A");
  }
  if (!config.groups || config.groups.length === 0) {
    errors.push("\u81F3\u5C11\u9700\u8981\u9009\u62E9\u4E00\u4E2A\u4EE3\u7406\u7EC4");
  }
  const requiredGroups = ["select", "final"];
  for (const group of requiredGroups) {
    if (!config.groups?.includes(group)) {
      errors.push(`\u5FC5\u987B\u5305\u542B "${group}" \u4EE3\u7406\u7EC4`);
    }
  }
  return {
    valid: errors.length === 0,
    errors
  };
}

// src/templates/config-template.ts
var SUBBOOST_TEMPLATE_CONFIG_SCHEMA = "subboost-template-config/v1";
var BUILTIN_MODULE_IDS = new Set(PROXY_GROUP_MODULES.map((module2) => module2.id));
var BUILTIN_RULE_KEYS = new Set(
  PROXY_GROUP_MODULES.flatMap((module2) => module2.rules.map((rule) => `module:${module2.id}:${rule.id}`))
);

// src/config/defaults.ts
var DEFAULT_SUBBOOST_CONFIG = {
  autoSelectStrategy: "url-test",
  testUrl: "https://www.gstatic.com/generate_204",
  testInterval: 300,
  ruleProviderBaseUrl: DEFAULT_RULE_PROVIDER_BASE_URL,
  customRules: [],
  ruleOrder: [],
  cnIpNoResolve: true,
  experimentalCnUseCnRuleSet: true,
  dnsYaml: "",
  mixedPort: 7897,
  allowLan: true
};
function buildDefaultUserConfig(template) {
  const templateConfig = TEMPLATES[template];
  return {
    enabledGroups: templateConfig.groups,
    enabledRules: templateConfig.rules,
    autoSelectStrategy: DEFAULT_SUBBOOST_CONFIG.autoSelectStrategy,
    testUrl: DEFAULT_SUBBOOST_CONFIG.testUrl,
    testInterval: DEFAULT_SUBBOOST_CONFIG.testInterval,
    ruleProviderBaseUrl: DEFAULT_SUBBOOST_CONFIG.ruleProviderBaseUrl,
    customRules: [...DEFAULT_SUBBOOST_CONFIG.customRules],
    ruleOrder: [...DEFAULT_SUBBOOST_CONFIG.ruleOrder],
    cnIpNoResolve: DEFAULT_SUBBOOST_CONFIG.cnIpNoResolve,
    experimentalCnUseCnRuleSet: DEFAULT_SUBBOOST_CONFIG.experimentalCnUseCnRuleSet,
    dnsYaml: DEFAULT_SUBBOOST_CONFIG.dnsYaml,
    mixedPort: DEFAULT_SUBBOOST_CONFIG.mixedPort,
    allowLan: DEFAULT_SUBBOOST_CONFIG.allowLan
  };
}
function buildDefaultBaseConfigPatch(options2 = {}) {
  return {
    "mixed-port": options2.mixedPort ?? DEFAULT_SUBBOOST_CONFIG.mixedPort,
    "allow-lan": options2.allowLan ?? DEFAULT_SUBBOOST_CONFIG.allowLan,
    mode: "rule",
    "log-level": "info",
    "unified-delay": true,
    "tcp-concurrent": true,
    "find-process-mode": "strict",
    dns: DEFAULT_DNS_CONFIG,
    profile: {
      "store-selected": true,
      "store-fake-ip": false
    },
    sniffer: {
      enable: true,
      "parse-pure-ip": true,
      sniff: {
        TLS: { ports: [443, 8443] },
        HTTP: { ports: [80, "8080-8880"], "override-destination": true },
        QUIC: { ports: [443, 8443] }
      }
    },
    "geodata-mode": true,
    "geo-auto-update": true,
    "geodata-loader": "standard",
    "geo-update-interval": 24,
    "geox-url": {
      geoip: "https://testingcf.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@release/geoip.dat",
      geosite: "https://testingcf.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@release/geosite.dat",
      mmdb: "https://testingcf.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@release/country.mmdb",
      asn: "https://github.com/xishang0128/geoip/releases/download/latest/GeoLite2-ASN.mmdb"
    }
  };
}
function buildDefaultSubBoostTemplateConfig(type2) {
  const template = TEMPLATES[type2];
  return {
    schema: SUBBOOST_TEMPLATE_CONFIG_SCHEMA,
    template: type2,
    enabledProxyGroups: template.groups,
    hiddenProxyGroups: [],
    customProxyGroups: [],
    proxyGroupAdvanced: {},
    proxyGroupAdvancedModeEnabled: false,
    customRuleSets: [],
    builtinRuleEdits: {},
    customRules: [],
    ruleOrder: [],
    cnIpNoResolve: DEFAULT_SUBBOOST_CONFIG.cnIpNoResolve,
    experimentalCnUseCnRuleSet: DEFAULT_SUBBOOST_CONFIG.experimentalCnUseCnRuleSet,
    dialerProxyGroups: [],
    proxyGroupNameOverrides: {},
    dnsYaml: DEFAULT_SUBBOOST_CONFIG.dnsYaml,
    mixedPort: DEFAULT_SUBBOOST_CONFIG.mixedPort,
    allowLan: DEFAULT_SUBBOOST_CONFIG.allowLan,
    testUrl: DEFAULT_SUBBOOST_CONFIG.testUrl,
    testInterval: DEFAULT_SUBBOOST_CONFIG.testInterval,
    ruleProviderBaseUrl: DEFAULT_SUBBOOST_CONFIG.ruleProviderBaseUrl
  };
}
var DEFAULT_BASE_CONFIG_YAML = `# \u57FA\u7840\u914D\u7F6E
mixed-port: ${DEFAULT_SUBBOOST_CONFIG.mixedPort}
allow-lan: ${DEFAULT_SUBBOOST_CONFIG.allowLan}
mode: rule
log-level: info
unified-delay: true
tcp-concurrent: true
find-process-mode: strict

# DNS \u914D\u7F6E
dns:
  enable: true
  listen: "127.0.0.1:5335"
  use-system-hosts: false
  enhanced-mode: fake-ip
  fake-ip-range: 198.18.0.1/16
  default-nameserver: [180.76.76.76, 182.254.118.118, 8.8.8.8, 180.184.2.2]
  nameserver: [180.76.76.76, 119.29.29.29, 180.184.1.1, 223.5.5.5, 8.8.8.8, "https://223.6.6.6/dns-query#h3=true", "https://dns.alidns.com/dns-query", "https://cloudflare-dns.com/dns-query", "https://doh.pub/dns-query"]
  fallback: ["https://dns.quad9.net/dns-query", "https://dns.alidns.com/dns-query", "https://doh.pub/dns-query", "https://public.dns.iij.jp/dns-query", "https://101.101.101.101/dns-query", "https://208.67.220.220/dns-query", "tls://8.8.4.4", "tls://1.0.0.1:853", "https://cloudflare-dns.com/dns-query", "https://dns.google/dns-query"]
  fallback-filter: {geoip: true, ipcidr: [240.0.0.0/4, 0.0.0.0/32, 127.0.0.1/32], domain: ["+.google.com", "+.facebook.com", "+.twitter.com", "+.youtube.com", "+.xn--ngstr-lra8j.com", "+.google.cn", "+.googleapis.cn", "+.googleapis.com", "+.gvt1.com"]}
  fake-ip-filter: ["*.lan", "stun.*.*.*", "stun.*.*", time.windows.com, time.nist.gov, time.apple.com, time.asia.apple.com, "*.ntp.org.cn", "*.openwrt.pool.ntp.org", time1.cloud.tencent.com, time.ustc.edu.cn, pool.ntp.org, ntp.ubuntu.com, ntp.aliyun.com, ntp1.aliyun.com, ntp2.aliyun.com, ntp3.aliyun.com, ntp4.aliyun.com, ntp5.aliyun.com, ntp6.aliyun.com, ntp7.aliyun.com, time1.aliyun.com, time2.aliyun.com, time3.aliyun.com, time4.aliyun.com, time5.aliyun.com, time6.aliyun.com, time7.aliyun.com, "*.time.edu.cn", time1.apple.com, time2.apple.com, time3.apple.com, time4.apple.com, time5.apple.com, time6.apple.com, time7.apple.com, time1.google.com, time2.google.com, time3.google.com, time4.google.com, music.163.com, "*.music.163.com", "*.126.net", musicapi.taihe.com, music.taihe.com, songsearch.kugou.com, trackercdn.kugou.com, "*.kuwo.cn", api-jooxtt.sanook.com, api.joox.com, joox.com, y.qq.com, "*.y.qq.com", streamoc.music.tc.qq.com, mobileoc.music.tc.qq.com, isure.stream.qqmusic.qq.com, dl.stream.qqmusic.qq.com, aqqmusic.tc.qq.com, amobile.music.tc.qq.com, "*.xiami.com", "*.music.migu.cn", music.migu.cn, "*.msftconnecttest.com", "*.msftncsi.com", localhost.ptlogin2.qq.com, "*.*.*.srv.nintendo.net", "*.*.stun.playstation.net", "xbox.*.*.microsoft.com", "*.ipv6.microsoft.com", "*.*.xboxlive.com", speedtest.cros.wr.pvp.net]
  # nameserver-policy \u793A\u4F8B\uFF08full\uFF09
  # nameserver-policy:
  #   "rule-set:company": ["172.16.0.53", "172.16.0.54"]
  #   "geosite:cn": ["223.5.5.5", "119.29.29.29"]
  #   "+.home.arpa": ["192.168.1.1"]
  #   "+.example.com": ["https://dns.quad9.net/dns-query", "tls://1.1.1.1:853"]

# \u914D\u7F6E\u6587\u4EF6\u7BA1\u7406
profile:
  store-selected: true
  store-fake-ip: false

# \u57DF\u540D/\u6D41\u91CF\u55C5\u63A2
sniffer:
  enable: true
  parse-pure-ip: true
  sniff:
    TLS: {ports: [443, 8443]}
    HTTP: {ports: [80, 8080-8880], override-destination: true}
    QUIC: {ports: [443, 8443]}`;

// src/generator/chain.ts
function resolveDialerGroupProxies(group) {
  if (group.type === "direct-first") return uniqueProxyNames(["DIRECT", ...group.relayNodes]);
  if (group.type === "reject-first") return uniqueProxyNames(["REJECT", ...group.relayNodes]);
  return uniqueProxyNames(group.relayNodes);
}
function generateDialerProxyGroups(groups, testUrl = DEFAULT_SUBBOOST_CONFIG.testUrl, testInterval = DEFAULT_SUBBOOST_CONFIG.testInterval, proxyProviderNames = []) {
  const providerUse = proxyProviderNames.length > 0 ? { use: proxyProviderNames } : {};
  return groups.map((group) => ({ group, proxies: resolveDialerGroupProxies(group) })).filter(({ proxies }) => proxies.length > 0).map((group) => {
    return buildTypedProxyGroup({
      name: group.group.name,
      groupType: group.group.type,
      proxies: group.proxies,
      testUrl: group.group.type === "url-test" ? group.group.testUrl || testUrl : testUrl,
      testInterval,
      strategy: group.group.strategy ?? DEFAULT_LOAD_BALANCE_STRATEGY,
      extraFields: providerUse,
      urlTestLazy: true
    });
  });
}
function applyDialerProxy(nodes, groups) {
  const nodeToDialer = /* @__PURE__ */ new Map();
  for (const group of groups) {
    for (const targetNode of group.targetNodes) {
      if (!nodeToDialer.has(targetNode)) {
        nodeToDialer.set(targetNode, group.name);
      }
    }
  }
  return nodes.map((node) => {
    const dialerName = nodeToDialer.get(node.name);
    if (dialerName) {
      return {
        ...node,
        "dialer-proxy": dialerName
      };
    }
    return node;
  });
}

// src/parser/ws-early-data.ts
function splitWsPathEarlyData(rawPath) {
  const value = (rawPath || "/").trim() || "/";
  const queryIndex = value.indexOf("?");
  if (queryIndex === -1) return { path: value };
  const basePath = value.slice(0, queryIndex) || "/";
  const query = value.slice(queryIndex + 1);
  const kept = [];
  let earlyData;
  for (const segment of query.split("&")) {
    if (!segment) continue;
    const eqIndex = segment.indexOf("=");
    const key = eqIndex === -1 ? segment : segment.slice(0, eqIndex);
    const rawValue = eqIndex === -1 ? "" : segment.slice(eqIndex + 1);
    if (key === "ed" && earlyData === void 0 && /^\d+$/.test(rawValue)) {
      const parsed = Number.parseInt(rawValue, 10);
      if (Number.isSafeInteger(parsed) && parsed > 0) {
        earlyData = parsed;
        continue;
      }
    }
    kept.push(segment);
  }
  if (earlyData === void 0) return { path: value };
  const path = kept.length > 0 ? `${basePath}?${kept.join("&")}` : basePath;
  return { path: path || "/", earlyData };
}

// src/mihomo/ech.ts
var STANDARD_BASE64_PATTERN = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
var DNS_LABEL_PATTERN = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?$/;
function isStandardBase64String(value) {
  const trimmed = value.trim();
  return trimmed.length > 0 && trimmed.length % 4 === 0 && STANDARD_BASE64_PATTERN.test(trimmed);
}
function isMihomoEchQueryServerName(value) {
  const trimmed = value.trim();
  const hostname = trimmed.endsWith(".") ? trimmed.slice(0, -1) : trimmed;
  if (!hostname || hostname.length > 253 || !hostname.includes(".") || !/[A-Za-z]/.test(hostname)) return false;
  return hostname.split(".").every((label) => label.length <= 63 && DNS_LABEL_PATTERN.test(label));
}
function hasAbsoluteResolverUri(value) {
  const schemeEnd = value.indexOf("://");
  if (schemeEnd <= 0) return false;
  const firstCode = value.charCodeAt(0);
  const firstIsAlpha = firstCode >= 65 && firstCode <= 90 || firstCode >= 97 && firstCode <= 122;
  if (!firstIsAlpha) return false;
  for (let index = 1; index < schemeEnd; index += 1) {
    const code = value.charCodeAt(index);
    const isAlpha = code >= 65 && code <= 90 || code >= 97 && code <= 122;
    const isDigit = code >= 48 && code <= 57;
    if (!isAlpha && !isDigit && code !== 43 && code !== 45 && code !== 46) return false;
  }
  const authorityStart = schemeEnd + 3;
  if (authorityStart >= value.length) return false;
  let authorityEnd = value.length;
  for (let index = authorityStart; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (code <= 32 || code === 127) return false;
    if (authorityEnd === value.length && (code === 47 || code === 63 || code === 35)) {
      authorityEnd = index;
    }
  }
  if (authorityEnd <= authorityStart) return false;
  try {
    return Boolean(new URL(`https://${value.slice(authorityStart)}`).hostname);
  } catch {
    return false;
  }
}
function buildMihomoEchOptsFromShareValue(value) {
  const normalized = typeof value === "string" ? value.trim() : "";
  if (!normalized) return { enable: true };
  if (isStandardBase64String(normalized)) return { enable: true, config: normalized };
  if (isMihomoEchQueryServerName(normalized)) {
    return { enable: true, "query-server-name": normalized };
  }
  const separatorIndex = normalized.indexOf("+");
  if (separatorIndex > 0) {
    const queryServerName = normalized.slice(0, separatorIndex).trim();
    const resolverUri = normalized.slice(separatorIndex + 1).trim();
    if (isMihomoEchQueryServerName(queryServerName) && hasAbsoluteResolverUri(resolverUri)) {
      return { enable: true, "query-server-name": queryServerName };
    }
  }
  return { enable: true };
}

// src/mihomo/reality.ts
function normalizeRealityShortId(input) {
  const raw = (() => {
    if (typeof input === "string") return input;
    if (typeof input === "number" || typeof input === "bigint") return String(input);
    return "";
  })().trim();
  if (!raw) return null;
  let normalized = raw;
  if (normalized.startsWith("0x") || normalized.startsWith("0X")) {
    normalized = normalized.slice(2);
  }
  normalized = normalized.replace(/[\s:_-]/g, "");
  if (!normalized) return null;
  if (!/^[0-9a-fA-F]+$/.test(normalized)) return null;
  normalized = normalized.toLowerCase();
  if (normalized.length % 2 === 1) normalized = `0${normalized}`;
  if (normalized.length > 16) return null;
  return normalized;
}

// src/mihomo/certificate-fingerprint.ts
function normalizeCertificateFingerprint(value) {
  if (typeof value !== "string") return null;
  const raw = value.trim();
  if (!raw) return null;
  const withoutPrefix = raw.replace(/^sha256\s+fingerprint\s*=\s*/i, "").replace(/^sha256[:=]\s*/i, "");
  const compact = withoutPrefix.replace(/:/g, "").toLowerCase();
  return /^[A-Fa-f0-9]{64}$/.test(compact) ? compact : null;
}

// src/node-identity.ts
function stableJsonStringifyWithKeyFilter(value, includeKey) {
  const seen = /* @__PURE__ */ new WeakSet();
  const normalize = (input) => {
    if (!input || typeof input !== "object") return input;
    if (seen.has(input)) return null;
    seen.add(input);
    if (Array.isArray(input)) return input.map(normalize);
    const obj = input;
    const keys = Object.keys(obj).sort();
    const out = {};
    for (const key of keys) {
      if (!includeKey(key)) continue;
      out[key] = normalize(obj[key]);
    }
    return out;
  };
  return JSON.stringify(normalize(value));
}
function stableJsonStringify(value) {
  return stableJsonStringifyWithKeyFilter(value, () => true);
}
function buildNodeContentKey(node, opts) {
  const record = node;
  const filtered = Object.fromEntries(
    Object.entries(record).filter(([key]) => {
      if (key === "name" || key === "_meta" || key.startsWith("_")) return false;
      if (opts?.ignoreServer && key === "server") return false;
      if (opts?.ignorePort && key === "port") return false;
      if (opts?.ignoreSni && key === "sni") return false;
      if (opts?.ignoreServername && key === "servername") return false;
      return true;
    })
  );
  return stableJsonStringifyWithKeyFilter(filtered, (key) => !key.startsWith("_"));
}
function buildScopedNodeIdentityKey(scope, node) {
  return `${scope.trim()}\0${buildNodeContentKey(node)}`;
}

// src/node-endpoint.ts
function validServer(value) {
  return typeof value === "string" && Boolean(value.trim());
}
function validPort(value) {
  return typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 65535;
}
function isValidMieruPortRange(value) {
  if (typeof value !== "string") return false;
  const match = /^(\d{1,5})-(\d{1,5})$/.exec(value);
  return Boolean(match && validPort(Number(match[1])) && validPort(Number(match[2])) && Number(match[1]) <= Number(match[2]));
}
function getNodeEndpointError(node) {
  const type2 = typeof node.type === "string" ? node.type.trim().toLowerCase() : "";
  if (["direct", "dns", "reject", "relay"].includes(type2)) return null;
  if (type2 === "wireguard" && node.peers !== void 0) {
    if (!Array.isArray(node.peers) || node.peers.length === 0) return "WireGuard peers \u5FC5\u987B\u662F\u975E\u7A7A\u6570\u7EC4";
    for (let index = 0; index < node.peers.length; index += 1) {
      const peer = node.peers[index];
      if (!peer || typeof peer !== "object" || Array.isArray(peer)) return `WireGuard peer #${index + 1} \u5FC5\u987B\u662F\u5BF9\u8C61`;
      if (!validServer(peer.server) || !validPort(peer.port) || !validServer(peer["public-key"])) {
        return `WireGuard peer #${index + 1} \u7F3A\u5C11\u6709\u6548 server\u3001port \u6216 public-key`;
      }
    }
    if (node.server === void 0 && node.port === void 0) return null;
  }
  if (!validServer(node.server)) return "\u7F3A\u5C11\u6709\u6548\u670D\u52A1\u5668\u5730\u5740";
  if (type2 === "mieru" && node["port-range"] !== void 0) {
    if (node.port !== void 0) return "Mieru port \u4E0E port-range \u4E0D\u80FD\u540C\u65F6\u8BBE\u7F6E";
    return isValidMieruPortRange(node["port-range"]) ? null : "Mieru port-range \u5FC5\u987B\u662F 1 \u5230 65535 \u5185\u7684\u9012\u589E\u8303\u56F4";
  }
  return validPort(node.port) ? null : "\u7AEF\u53E3\u5FC5\u987B\u662F 1 \u5230 65535 \u7684\u6574\u6570";
}

// src/mihomo/string-scalar.ts
var MIHOMO_STRING_SCALAR_FIELDS = /* @__PURE__ */ new Set([
  "password",
  "username",
  "psk",
  "auth-str",
  "token",
  "private-key-passphrase",
  "obfs-password"
]);
function normalizeMihomoStringScalar(value) {
  if (typeof value === "string") return value;
  if (typeof value === "number" && Number.isSafeInteger(value)) return String(value);
  return void 0;
}

// src/mihomo/proxy-sanitizer.ts
var REALITY_PUBLIC_KEY_PATTERN = /^[A-Za-z0-9_-]{43}$/;
var WIREGUARD_KEY_PATTERN = /^[A-Za-z0-9+/]{43}=$/;
var SSH_SERVER_FINGERPRINT_PATTERN = /^SHA256:[A-Za-z0-9+/]{43}=?$/;
var VLESS_ENCRYPTION_PATTERN = /^mlkem768x25519plus\.(?:native|xorpub|random)\.(?:1rtt|0rtt)\.[A-Za-z0-9+/=_-]+(?:\.[A-Za-z0-9+/=_-]+)*$/;
var BOOLEAN_PROXY_FIELDS = /* @__PURE__ */ new Set([
  "udp",
  "tls",
  "skip-cert-verify",
  "tfo",
  "mptcp",
  "reuse",
  "disable-sni",
  "reduce-rtt",
  "authenticated-length",
  "global-padding",
  "udp-over-tcp"
]);
var CLIENT_FINGERPRINT_PROXY_TYPES = /* @__PURE__ */ new Set(["vmess", "vless", "trojan", "anytls", "trusttunnel"]);
var CLIENT_FINGERPRINT_ALIASES = /* @__PURE__ */ new Set(["chrome", "firefox", "safari", "ios", "android", "edge", "random", "none"]);
var UNSUPPORTED_MIHOMO_PROXY_TYPES = /* @__PURE__ */ new Set(["socks4", "h2-connect", "trust-tunnel", "external"]);
var INVALID_MIHOMO_NODE_FLAG = "_subboost-invalid-mihomo-node";
var REQUIRED_STRING_FIELDS_BY_TYPE = {
  ss: ["cipher", "password"],
  ssr: ["cipher", "password", "protocol", "obfs"],
  vmess: ["uuid"],
  vless: ["uuid"],
  trojan: ["password"],
  anytls: ["password"],
  hysteria2: ["password"],
  snell: ["psk"]
};
function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
function hasOwn(record, key) {
  return Object.prototype.hasOwnProperty.call(record, key);
}
function parseBoolish(value) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") {
    if (value === 1) return true;
    if (value === 0) return false;
    return void 0;
  }
  if (typeof value !== "string") return void 0;
  const normalized = value.trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;
  return void 0;
}
function normalizeString(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed || null;
}
function normalizeClientFingerprintAlias(value) {
  const normalized = normalizeString(value)?.toLowerCase();
  if (!normalized || !CLIENT_FINGERPRINT_ALIASES.has(normalized)) return null;
  return normalized;
}
function normalizeWireGuardKey(value) {
  const normalized = normalizeString(value);
  if (!normalized || !WIREGUARD_KEY_PATTERN.test(normalized)) return null;
  return normalized;
}
function normalizePemPrivateKey(value) {
  const normalized = normalizeString(value);
  if (!normalized || !/^-----BEGIN [A-Z0-9 ]*PRIVATE KEY-----/.test(normalized)) return null;
  return normalized;
}
function isAsciiAlphaNumericOrHyphen(value) {
  if (!value) return false;
  for (const char of value) {
    const ok = char >= "a" && char <= "z" || char >= "A" && char <= "Z" || char >= "0" && char <= "9" || char === "-";
    if (!ok) return false;
  }
  return true;
}
function isBase64Token(value) {
  if (!value) return false;
  for (const char of value) {
    const ok = char >= "a" && char <= "z" || char >= "A" && char <= "Z" || char >= "0" && char <= "9" || char === "+" || char === "/" || char === "=";
    if (!ok) return false;
  }
  return true;
}
function findWhitespaceIndex(value) {
  for (let i = 0; i < value.length; i += 1) {
    if (value[i].trim() === "") return i;
  }
  return -1;
}
function isSupportedSshHostKeyType(value) {
  if (value === "ssh-ed25519" || value === "ssh-rsa" || value === "ssh-dss") return true;
  return value.startsWith("ssh-ecdsa-") && isAsciiAlphaNumericOrHyphen(value.slice("ssh-ecdsa-".length));
}
function isSshHostKey(value) {
  const typeEnd = findWhitespaceIndex(value);
  if (typeEnd <= 0) return false;
  const keyType = value.slice(0, typeEnd);
  if (!isSupportedSshHostKeyType(keyType)) return false;
  const rest = value.slice(typeEnd).trimStart();
  if (!rest) return false;
  const keyEnd = findWhitespaceIndex(rest);
  const key = keyEnd === -1 ? rest : rest.slice(0, keyEnd);
  return isBase64Token(key);
}
function normalizeSshHostKeys(value) {
  if (!Array.isArray(value)) return void 0;
  const keys = value.filter((item) => typeof item === "string").map((item) => item.trim()).filter((item) => isSshHostKey(item));
  return keys.length > 0 ? keys : void 0;
}
function normalizeSshServerFingerprint(value) {
  const normalized = normalizeString(value);
  if (!normalized || !SSH_SERVER_FINGERPRINT_PATTERN.test(normalized)) return null;
  return normalized;
}
function normalizeMihomoRealityPublicKey(input) {
  const value = normalizeString(input);
  if (!value || !REALITY_PUBLIC_KEY_PATTERN.test(value)) return null;
  return value;
}
function isMihomoSupportedProxyNode(node) {
  if (!isPlainObject(node)) return false;
  const type2 = typeof node.type === "string" ? node.type : "";
  if (node[INVALID_MIHOMO_NODE_FLAG]) return false;
  if (!type2 || UNSUPPORTED_MIHOMO_PROXY_TYPES.has(type2)) return false;
  if (getNodeEndpointError(node)) return false;
  const requiredFields = REQUIRED_STRING_FIELDS_BY_TYPE[type2] || [];
  for (const field of requiredFields) {
    if (!normalizeString(normalizeMihomoStringScalar(node[field]))) return false;
  }
  if (type2 === "wireguard") {
    if (!normalizeWireGuardKey(node["private-key"])) return false;
    for (const key of ["public-key", "pre-shared-key"]) {
      if (Object.prototype.hasOwnProperty.call(node, key) && node[key] !== void 0 && !normalizeWireGuardKey(node[key])) {
        return false;
      }
    }
    if (Array.isArray(node.peers) && node.peers.some((peer) => !isPlainObject(peer) || !normalizeWireGuardKey(peer["public-key"]) || peer["pre-shared-key"] !== void 0 && !normalizeWireGuardKey(peer["pre-shared-key"]))) return false;
  }
  if (type2 === "ssh" && !normalizeString(normalizeMihomoStringScalar(node.password)) && !normalizePemPrivateKey(node["private-key"])) {
    return false;
  }
  if (!isSupportedSsPlugin(node)) return false;
  if (type2 === "vless") {
    if (hasOwn(node, "reality-opts") && node["reality-opts"] !== void 0 && sanitizeRealityOpts(node["reality-opts"]) === void 0) {
      return false;
    }
    if (String(node.network ?? "") === "xhttp") {
      const mainHasReality = hasOwn(node, "reality-opts") && node["reality-opts"] !== void 0 && sanitizeRealityOpts(node["reality-opts"]) !== void 0;
      const xhttp = normalizeXhttpOptsForGeneration(node["xhttp-opts"], mainHasReality);
      if (xhttp.invalid) return false;
    }
  }
  return true;
}
function normalizeAlpn(value) {
  if (typeof value === "string") {
    const protocols2 = value.split(/[|,]/).map((item) => item.trim()).filter(Boolean);
    return protocols2.length > 0 ? protocols2 : void 0;
  }
  if (!Array.isArray(value)) return void 0;
  const protocols = value.filter((item) => typeof item === "string").map((item) => item.trim()).filter(Boolean);
  return protocols.length > 0 ? protocols : void 0;
}
function normalizeWireGuardReserved(value) {
  const rawValues = Array.isArray(value) ? value : typeof value === "string" ? value.split(",") : [];
  const values = rawValues.map((item) => Number.parseInt(String(item).trim(), 10));
  if (values.length !== 3) return void 0;
  if (!values.every((item) => Number.isInteger(item) && item >= 0 && item <= 255)) return void 0;
  return values;
}
function sanitizeEchOpts(value) {
  if (!isPlainObject(value)) return void 0;
  const out = {};
  const explicitQueryServerName = normalizeString(value["query-server-name"]);
  for (const [key, raw] of Object.entries(value)) {
    if (key.startsWith("_")) continue;
    if (key === "enable") {
      const normalized = parseBoolish(raw);
      if (normalized !== void 0) out[key] = normalized;
      continue;
    }
    if (key === "config") {
      const config = normalizeString(raw);
      if (config && isStandardBase64String(config)) {
        out[key] = config;
      } else if (config && !explicitQueryServerName && isMihomoEchQueryServerName(config)) {
        out["query-server-name"] = config;
      }
      continue;
    }
    if (key === "query-server-name") {
      if (explicitQueryServerName) out[key] = explicitQueryServerName;
      continue;
    }
    out[key] = raw;
  }
  return Object.keys(out).length > 0 ? out : void 0;
}
function sanitizeRealityOpts(value) {
  if (!isPlainObject(value)) return void 0;
  const out = { ...value };
  const publicKey = normalizeMihomoRealityPublicKey(out["public-key"]);
  if (!publicKey) return void 0;
  out["public-key"] = publicKey;
  const shortId = normalizeRealityShortId(out["short-id"]);
  if (shortId) out["short-id"] = shortId;
  else delete out["short-id"];
  return Object.keys(out).length > 0 ? out : void 0;
}
function sanitizeWsOpts(value) {
  if (!isPlainObject(value)) return void 0;
  const out = { ...value };
  const isHttpUpgrade = parseBoolish(out["v2ray-http-upgrade"]) === true;
  if (isHttpUpgrade) {
    out["v2ray-http-upgrade"] = true;
    delete out["early-data-header-name"];
    delete out["max-early-data"];
    delete out["_v2ray-http-upgrade-ed"];
  }
  const path = normalizeString(out.path);
  if (path) {
    const { path: wsPath, earlyData } = splitWsPathEarlyData(path);
    out.path = wsPath;
    if (earlyData !== void 0) {
      if (!isHttpUpgrade && !hasOwn(out, "early-data-header-name") && !hasOwn(out, "max-early-data")) {
        out["early-data-header-name"] = "Sec-WebSocket-Protocol";
        out["max-early-data"] = earlyData;
      }
    }
  }
  return Object.keys(out).length > 0 ? out : void 0;
}
function sanitizeDownloadRealityOpts(value, mainHasReality) {
  if (!isPlainObject(value)) return { invalid: true };
  const out = { ...value };
  const rawPublicKey = normalizeString(out["public-key"]);
  if (!rawPublicKey) {
    if (out["public-key"] === "" && mainHasReality) {
      return { value: { "public-key": "" }, invalid: false };
    }
    return { invalid: true };
  }
  const publicKey = normalizeMihomoRealityPublicKey(rawPublicKey);
  if (!publicKey) return { invalid: true };
  out["public-key"] = publicKey;
  const shortId = normalizeRealityShortId(out["short-id"]);
  if (shortId) out["short-id"] = shortId;
  else delete out["short-id"];
  return { value: out, invalid: false };
}
function normalizeXhttpOptsForGeneration(value, mainHasReality) {
  if (!isPlainObject(value)) return { invalid: false };
  const out = { ...value };
  const mode = normalizeString(out.mode)?.toLowerCase();
  const downloadSettings = isPlainObject(out["download-settings"]) ? { ...out["download-settings"] } : void 0;
  if (mode === "stream-one" && downloadSettings) return { invalid: true };
  if (hasOwn(out, "ech-opts")) {
    const echOpts = sanitizeEchOpts(out["ech-opts"]);
    if (echOpts === void 0) delete out["ech-opts"];
    else out["ech-opts"] = echOpts;
  }
  if (downloadSettings) {
    if (hasOwn(downloadSettings, "ech-opts")) {
      const echOpts = sanitizeEchOpts(downloadSettings["ech-opts"]);
      if (echOpts === void 0) delete downloadSettings["ech-opts"];
      else downloadSettings["ech-opts"] = echOpts;
    }
    if (hasOwn(downloadSettings, "reality-opts")) {
      const reality = sanitizeDownloadRealityOpts(downloadSettings["reality-opts"], mainHasReality);
      if (reality.invalid) return { invalid: true };
      if (reality.value) downloadSettings["reality-opts"] = reality.value;
    } else if (mainHasReality) {
      downloadSettings["reality-opts"] = { "public-key": "" };
    }
    out["download-settings"] = downloadSettings;
  }
  return { value: out, invalid: false };
}
function isSupportedSsPlugin(node) {
  if (node.type !== "ss") return true;
  const plugin = normalizeString(node.plugin)?.toLowerCase();
  if (!plugin || plugin !== "v2ray-plugin" && plugin !== "xray-plugin") return true;
  const opts = isPlainObject(node["plugin-opts"]) ? node["plugin-opts"] : void 0;
  const mode = normalizeString(opts?.mode)?.toLowerCase();
  return !mode || mode === "websocket" || mode === "ws";
}
function sanitizeVlessEncryption(value) {
  const encryption = normalizeString(value);
  if (!encryption) return void 0;
  if (encryption === "none") return encryption;
  if (!encryption.startsWith("mlkem768x25519plus")) return encryption;
  return VLESS_ENCRYPTION_PATTERN.test(encryption) ? encryption : void 0;
}
function normalizeMihomoVlessForGeneration(node) {
  if (node.type !== "vless") return node;
  const copy = { ...node };
  const hasRealityField = hasOwn(copy, "reality-opts") && copy["reality-opts"] !== void 0;
  const realityOpts = hasRealityField ? sanitizeRealityOpts(copy["reality-opts"]) : void 0;
  const mainHasReality = Boolean(realityOpts);
  if (hasRealityField) {
    if (!realityOpts) {
      copy[INVALID_MIHOMO_NODE_FLAG] = true;
    } else {
      copy["reality-opts"] = realityOpts;
      if (copy.tls !== true) copy.tls = true;
      if (!normalizeString(copy["client-fingerprint"])) {
        copy["client-fingerprint"] = "chrome";
      }
    }
  }
  if (String(copy.network ?? "") === "xhttp" && hasOwn(copy, "xhttp-opts")) {
    const xhttp = normalizeXhttpOptsForGeneration(copy["xhttp-opts"], mainHasReality);
    if (xhttp.invalid) {
      copy[INVALID_MIHOMO_NODE_FLAG] = true;
    } else if (xhttp.value) {
      copy["xhttp-opts"] = xhttp.value;
    } else {
      delete copy["xhttp-opts"];
    }
  }
  return copy;
}
function sanitizeMihomoProxyNode(node) {
  if (!isPlainObject(node)) return node;
  const copy = { ...node };
  for (const field of MIHOMO_STRING_SCALAR_FIELDS) {
    if (copy[field] === void 0 || copy[field] === null) continue;
    const value = normalizeMihomoStringScalar(copy[field]);
    if (value === void 0) copy[INVALID_MIHOMO_NODE_FLAG] = true;
    else copy[field] = value;
  }
  for (const key of BOOLEAN_PROXY_FIELDS) {
    if (!Object.prototype.hasOwnProperty.call(copy, key)) continue;
    const normalized = parseBoolish(copy[key]);
    if (normalized === void 0) delete copy[key];
    else copy[key] = normalized;
  }
  if (Object.prototype.hasOwnProperty.call(copy, "alpn")) {
    const alpn = normalizeAlpn(copy.alpn);
    if (alpn) copy.alpn = alpn;
    else delete copy.alpn;
  }
  if (Object.prototype.hasOwnProperty.call(copy, "ech-opts")) {
    const echOpts = sanitizeEchOpts(copy["ech-opts"]);
    if (echOpts === void 0) delete copy["ech-opts"];
    else copy["ech-opts"] = echOpts;
  }
  if (Object.prototype.hasOwnProperty.call(copy, "ws-opts")) {
    const wsOpts = sanitizeWsOpts(copy["ws-opts"]);
    if (wsOpts === void 0) delete copy["ws-opts"];
    else copy["ws-opts"] = wsOpts;
  }
  if (copy.type === "https") {
    copy.type = "http";
    if (copy.tls !== false) copy.tls = true;
  }
  const type2 = typeof copy.type === "string" ? copy.type : "";
  if (Object.prototype.hasOwnProperty.call(copy, "fingerprint")) {
    const clientFingerprint = normalizeClientFingerprintAlias(copy.fingerprint);
    if (clientFingerprint) {
      if (CLIENT_FINGERPRINT_PROXY_TYPES.has(type2) && !copy["client-fingerprint"]) {
        copy["client-fingerprint"] = clientFingerprint;
      }
      delete copy.fingerprint;
    } else {
      const certificateFingerprint = normalizeCertificateFingerprint(copy.fingerprint);
      if (certificateFingerprint) copy.fingerprint = certificateFingerprint;
      else delete copy.fingerprint;
    }
  }
  if (type2 === "vless") {
    const normalized = normalizeMihomoVlessForGeneration(copy);
    Object.keys(copy).forEach((key) => delete copy[key]);
    Object.assign(copy, normalized);
    if (Object.prototype.hasOwnProperty.call(copy, "encryption")) {
      const encryption = sanitizeVlessEncryption(copy.encryption);
      if (encryption === void 0) delete copy.encryption;
      else copy.encryption = encryption;
    }
  }
  if (type2 === "wireguard") {
    for (const key of ["private-key", "public-key", "pre-shared-key"]) {
      if (!Object.prototype.hasOwnProperty.call(copy, key)) continue;
      const keyValue = normalizeWireGuardKey(copy[key]);
      if (keyValue) copy[key] = keyValue;
      else delete copy[key];
    }
    if (Object.prototype.hasOwnProperty.call(copy, "reserved")) {
      const reserved = normalizeWireGuardReserved(copy.reserved);
      if (reserved) copy.reserved = reserved;
      else delete copy.reserved;
    }
  }
  if (type2 === "ssh" && Object.prototype.hasOwnProperty.call(copy, "private-key")) {
    const privateKey = normalizePemPrivateKey(copy["private-key"]);
    if (privateKey) copy["private-key"] = privateKey;
    else {
      delete copy["private-key"];
      delete copy["private-key-passphrase"];
    }
  }
  if (type2 === "ssh" && Object.prototype.hasOwnProperty.call(copy, "host-key")) {
    const hostKeys = normalizeSshHostKeys(copy["host-key"]);
    if (hostKeys) copy["host-key"] = hostKeys;
    else delete copy["host-key"];
  }
  if (type2 === "ssh" && Object.prototype.hasOwnProperty.call(copy, "server-fingerprint")) {
    const fingerprint = normalizeSshServerFingerprint(copy["server-fingerprint"]);
    if (fingerprint) copy["server-fingerprint"] = fingerprint;
    else delete copy["server-fingerprint"];
  }
  return copy;
}

// src/generator/yaml.ts
var PROXY_FIELD_ORDER_CORE = ["name", "type", "server", "port"];
var PROXY_FIELD_ORDER_PROTOCOL = {
  ss: ["cipher", "password", "udp-over-tcp", "udp-over-tcp-version", "tfo", "plugin", "plugin-opts"],
  ssr: ["cipher", "password", "protocol", "protocol-param", "obfs", "obfs-param"],
  vmess: ["uuid", "alterId", "cipher", "packet-encoding", "authenticated-length", "global-padding"],
  vless: ["uuid", "encryption", "packet-encoding"],
  trojan: ["password"],
  anytls: ["password"],
  hysteria: ["protocol", "auth-str", "obfs", "ports", "up", "down"],
  hysteria2: ["password", "obfs", "obfs-password", "up", "down", "ports", "hop-interval", "fingerprint", "alpn"],
  socks5: ["username", "password"],
  socks4: ["username", "password"],
  http: ["username", "password", "headers"],
  https: ["username", "password", "headers"],
  tuic: [
    "token",
    "uuid",
    "password",
    "congestion-controller",
    "udp-relay-mode",
    "request-timeout",
    "heartbeat-interval",
    "max-open-streams",
    "max-idle-time",
    "tfo"
  ],
  wireguard: [
    "private-key",
    "public-key",
    "pre-shared-key",
    "ip",
    "ipv6",
    "mtu",
    "keepalive",
    "reserved",
    "dns",
    "allowed-ips",
    "peers"
  ],
  snell: ["psk", "version", "obfs-opts", "reuse"],
  direct: ["udp", "ip-version", "interface-name", "routing-mark"],
  dns: ["udp"],
  reject: [],
  mieru: ["username", "password", "transport", "port-range", "multiplexing", "handshake-mode"],
  masque: ["username", "password"],
  trusttunnel: ["username", "password", "health-check", "quic", "congestion-controller", "max-connections", "min-streams", "max-streams"],
  sudoku: [
    "key",
    "aead-method",
    "padding-min",
    "padding-max",
    "table-type",
    "http-mask",
    "http-mask-host",
    "http-mask-mode",
    "custom-table",
    "custom-tables"
  ],
  relay: ["proxies"]
};
var PROXY_FIELD_ORDER_TLS = ["tls", "sni", "servername", "skip-cert-verify", "ech-opts", "client-fingerprint"];
var PROXY_FIELD_ORDER_TRANSPORT = ["network", "flow", "alpn", "udp"];
var PROXY_FIELD_ORDER_ADVANCED = ["reality-opts", "ws-opts", "grpc-opts", "h2-opts", "http-opts", "xhttp-opts"];
var PROXY_FIELD_CHAIN_LAST = "dialer-proxy";
var PROXY_GROUP_FIELD_ORDER = [
  "name",
  "type",
  "proxies",
  "include-all",
  "include-all-proxies",
  "include-all-providers",
  "use",
  "url",
  "interval",
  "lazy",
  "tolerance",
  "strategy",
  "filter",
  "exclude-filter",
  "exclude-type",
  "expected-status",
  "timeout",
  "max-failed-times",
  "disable-udp",
  "interface-name",
  "routing-mark",
  "hidden",
  "icon"
];
var UDP_SUPPORTED_TYPES = /* @__PURE__ */ new Set([
  "ss",
  "ssr",
  "vmess",
  "vless",
  "trojan",
  "anytls",
  "hysteria2",
  "tuic",
  "socks5"
]);
function getOrderedProxyKeys(node) {
  const keys = Object.keys(node).filter((k) => node[k] !== void 0 && !k.startsWith("_"));
  const out = [];
  const seen = /* @__PURE__ */ new Set();
  const push = (k) => {
    if (!seen.has(k) && Object.prototype.hasOwnProperty.call(node, k) && node[k] !== void 0) {
      out.push(k);
      seen.add(k);
    }
  };
  PROXY_FIELD_ORDER_CORE.forEach(push);
  const nodeType = String(node.type ?? "");
  (PROXY_FIELD_ORDER_PROTOCOL[nodeType] ?? []).forEach(
    push
  );
  PROXY_FIELD_ORDER_TLS.forEach(push);
  PROXY_FIELD_ORDER_TRANSPORT.forEach(push);
  PROXY_FIELD_ORDER_ADVANCED.forEach(push);
  const rest = keys.filter((k) => !seen.has(k) && k !== PROXY_FIELD_CHAIN_LAST);
  rest.sort((a, b) => a < b ? -1 : a > b ? 1 : 0);
  rest.forEach(push);
  push(PROXY_FIELD_CHAIN_LAST);
  return out;
}
function canonicalizeProxy(node) {
  const copy = sanitizeMihomoProxyNode(node);
  const type2 = typeof copy.type === "string" ? copy.type : "";
  if (copy.udp === void 0 && UDP_SUPPORTED_TYPES.has(type2)) {
    copy.udp = true;
  }
  const keys = getOrderedProxyKeys(copy);
  const out = {};
  for (const k of keys) {
    if (copy[k] !== void 0) out[k] = copy[k];
  }
  return out;
}
function getOrderedMappingKeys(record, preferredKeys) {
  const keys = Object.keys(record).filter((k) => record[k] !== void 0 && !k.startsWith("_"));
  const out = [];
  const seen = /* @__PURE__ */ new Set();
  const push = (key) => {
    if (!seen.has(key) && Object.prototype.hasOwnProperty.call(record, key) && record[key] !== void 0) {
      out.push(key);
      seen.add(key);
    }
  };
  preferredKeys.forEach(push);
  keys.filter((key) => !seen.has(key)).sort((a, b) => a < b ? -1 : a > b ? 1 : 0).forEach(push);
  return out;
}
function escapeYamlDoubleQuotedString(value) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\r/g, "\\r").replace(/\n/g, "\\n").replace(/\t/g, "\\t");
}
function toInlineYaml(value) {
  if (value === null || value === void 0) return "null";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "number") return String(value);
  if (typeof value === "string") {
    const shouldQuoteYamlString = (s) => {
      if (s === "") return true;
      if (/[+":,\[\]{}#&*!|>'%@`?\n]/.test(s) || s.includes(" ")) return true;
      const lower = s.toLowerCase();
      if (lower === "null" || lower === "~" || lower === "true" || lower === "false" || lower === "yes" || lower === "no" || lower === "on" || lower === "off") {
        return true;
      }
      if (/^[+-]?\d+$/.test(s)) return true;
      if (/^[+-]?(?:\d*\.\d+|\d+\.\d*)(?:[eE][+-]?\d+)?$/.test(s)) return true;
      if (/^[+-]?\d+[eE][+-]?\d+$/.test(s)) return true;
      return false;
    };
    if (shouldQuoteYamlString(value)) {
      return `"${escapeYamlDoubleQuotedString(value)}"`;
    }
    return value;
  }
  if (Array.isArray(value)) {
    return `[${value.map(toInlineYaml).join(", ")}]`;
  }
  if (typeof value === "object") {
    const pairs2 = Object.entries(value).filter(([, v]) => v !== void 0).map(([k, v]) => {
      if (k === "name" && typeof v === "string") {
        return `${k}: "${escapeYamlDoubleQuotedString(v)}"`;
      }
      return `${k}: ${toInlineYaml(v)}`;
    });
    return `{${pairs2.join(", ")}}`;
  }
  return String(value);
}
function toBlockSequenceScalar(value) {
  const trimmed = value.trim();
  const ambiguous = !value || trimmed !== value || /[\r\n#]/.test(value) || /:\s/.test(value) || /^[\-?:,\[\]{}&*!|>'"%@`]/.test(value) || /^(?:null|~|true|false|yes|no|on|off)$/i.test(value) || /^[+-]?(?:\d+|\d*\.\d+|\d+\.\d*)(?:[eE][+-]?\d+)?$/.test(value);
  return ambiguous ? `"${escapeYamlDoubleQuotedString(value)}"` : value;
}
function normalizeDnsPolicyValue(value) {
  if (Array.isArray(value)) {
    const servers = value.filter((item) => typeof item === "string").map((item) => item.trim()).filter(Boolean);
    return servers.length > 0 ? servers : null;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }
  return null;
}
function collectDnsPolicyEntries(policy) {
  if (!policy || typeof policy !== "object" || Array.isArray(policy)) return [];
  const entries = [];
  for (const [patternRaw, valueRaw] of Object.entries(policy)) {
    const pattern = patternRaw.trim();
    const value = normalizeDnsPolicyValue(valueRaw);
    if (!pattern || !value) continue;
    entries.push([pattern, value]);
  }
  entries.sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0);
  return entries;
}
function isPlainObject2(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
function appendYamlField(lines, key, value, indent = "") {
  if (value === void 0) return;
  if (!isPlainObject2(value)) {
    lines.push(`${indent}${toInlineYaml(key)}: ${toInlineYaml(value)}`);
    return;
  }
  const entries = Object.entries(value).filter(([, v]) => v !== void 0);
  if (entries.length === 0) {
    lines.push(`${indent}${toInlineYaml(key)}: {}`);
    return;
  }
  lines.push(`${indent}${toInlineYaml(key)}:`);
  for (const [childKey, childValue] of entries) {
    appendYamlField(lines, childKey, childValue, `${indent}  `);
  }
}
function appendListenersSection(lines, listeners) {
  if (listeners === void 0) return false;
  if (!Array.isArray(listeners)) {
    appendYamlField(lines, "listeners", listeners);
    return true;
  }
  if (listeners.length === 0) {
    lines.push("listeners: []");
    return true;
  }
  lines.push("listeners:");
  for (const listener of listeners) {
    lines.push(`  - ${toInlineYaml(listener)}`);
  }
  return true;
}
var GENERATED_SECTION_KEYS = /* @__PURE__ */ new Set(["listeners", "proxies", "proxy-groups", "rule-providers", "rules"]);
function configToYaml(config) {
  const lines = [];
  const baseTopLevelFields = Object.entries(config).filter(([key, value]) => value !== void 0 && !GENERATED_SECTION_KEYS.has(key));
  for (const [key, value] of baseTopLevelFields) {
    appendYamlField(lines, key, value);
  }
  if (lines.length > 0) lines.push("");
  if (appendListenersSection(lines, config.listeners)) {
    lines.push("");
  }
  lines.push("proxies:");
  if (config.proxies && config.proxies.length > 0) {
    for (const proxy of config.proxies) {
      const orderedProxy = canonicalizeProxy(proxy);
      lines.push(`  - ${toInlineYaml(orderedProxy)}`);
    }
  }
  lines.push("");
  lines.push("proxy-groups:");
  if (config["proxy-groups"]) {
    for (const group of config["proxy-groups"]) {
      const record = group;
      const keys = getOrderedMappingKeys(record, PROXY_GROUP_FIELD_ORDER);
      if (keys.length === 0) continue;
      keys.forEach((key, index) => {
        const prefix = index === 0 ? "  - " : "    ";
        lines.push(`${prefix}${toInlineYaml(key)}: ${toInlineYaml(record[key])}`);
      });
    }
  }
  lines.push("");
  lines.push("rule-providers:");
  if (config["rule-providers"]) {
    for (const [name, provider] of Object.entries(config["rule-providers"])) {
      lines.push(`  ${name}: ${toInlineYaml(provider)}`);
    }
  }
  lines.push("");
  lines.push("rules:");
  if (config.rules) {
    for (const rule of config.rules) {
      lines.push(`  - ${toBlockSequenceScalar(rule)}`);
    }
  }
  return lines.join("\n");
}

// src/subscription/dialer-relay-group-names.ts
function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
function getValidDialerRelayGroupNames(config, options2 = {}) {
  const customGroupNames = Array.isArray(config.customProxyGroups) ? config.customProxyGroups.filter((group) => isRecord(group) && group.enabled !== false).map((group) => typeof group.name === "string" ? group.name.trim() : "").filter(Boolean) : [];
  const overrides = isRecord(config.proxyGroupNameOverrides) ? config.proxyGroupNameOverrides : {};
  const configuredEnabledGroups = Array.isArray(config.enabledGroups) ? config.enabledGroups.map((value) => typeof value === "string" ? value.trim() : "").filter(Boolean) : [];
  const enabledGroups = configuredEnabledGroups.length > 0 ? configuredEnabledGroups : [...options2.defaultEnabledGroups ?? []];
  const enabledGroupIds = new Set(enabledGroups);
  const builtinGroupNames = PROXY_GROUP_MODULES.filter((module2) => enabledGroupIds.has(module2.id)).map(
    (module2) => {
      const override = overrides[module2.id];
      return resolveProxyGroupModuleName(module2, typeof override === "string" ? override : void 0);
    }
  );
  return /* @__PURE__ */ new Set([...customGroupNames, ...builtinGroupNames]);
}

// src/generator/group-listeners.ts
var GroupListenerError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "GroupListenerError";
  }
};
function isValidPort(port) {
  return typeof port === "number" && Number.isInteger(port) && port >= 1 && port <= 65535;
}
function resolveGroupListenerEntries(options2) {
  const { bindings, resolveTarget, effectiveMixedPort, nodeListenerPorts, baseListenerPorts, usedNames } = options2;
  if (!Array.isArray(bindings) || bindings.length === 0) return [];
  const usedPorts = /* @__PURE__ */ new Map();
  if (isValidPort(effectiveMixedPort)) usedPorts.set(effectiveMixedPort, "\u5168\u5C40 mixed-port");
  for (const port of nodeListenerPorts) {
    if (isValidPort(port) && !usedPorts.has(port)) usedPorts.set(port, "\u8282\u70B9\u76D1\u542C\u7AEF\u53E3");
  }
  for (const port of baseListenerPorts) {
    if (isValidPort(port) && !usedPorts.has(port)) usedPorts.set(port, "\u57FA\u7840\u548C DNS \u914D\u7F6E\u4E2D\u7684 listeners");
  }
  const seenTargets = /* @__PURE__ */ new Set();
  const names = new Set(usedNames);
  const out = [];
  let autoIndex = 0;
  for (const binding of bindings) {
    if (!binding || typeof binding !== "object") continue;
    const resolution = resolveTarget(binding);
    if (!resolution.exists) {
      throw new GroupListenerError(
        "\u5206\u7EC4\u76D1\u542C\u7684\u76EE\u6807\u7B56\u7565\u7EC4\u5DF2\u88AB\u5220\u9664\uFF0C\u8BF7\u5728\u5BF9\u5E94\u7B56\u7565\u7EC4\u7684\u9AD8\u7EA7\u8BBE\u7F6E\u4E2D\u79FB\u9664\u6216\u4FEE\u6539\u8BE5\u76D1\u542C\u914D\u7F6E\u3002"
      );
    }
    if (binding.enabled === false || !resolution.active) continue;
    const targetName = (resolution.name ?? "").trim();
    if (!targetName) {
      throw new GroupListenerError("\u5206\u7EC4\u76D1\u542C\u7684\u76EE\u6807\u7B56\u7565\u7EC4\u540D\u79F0\u4E3A\u7A7A\uFF0C\u65E0\u6CD5\u751F\u6210 listener\u3002");
    }
    const targetKey = `${binding.target.kind}:${binding.target.id}`;
    if (seenTargets.has(targetKey)) continue;
    seenTargets.add(targetKey);
    if (!isValidPort(binding.port)) {
      throw new GroupListenerError(`\u7B56\u7565\u7EC4\u300C${targetName}\u300D\u7684\u76D1\u542C\u7AEF\u53E3\u65E0\u6548\uFF08\u9700\u4E3A 1-65535 \u7684\u6574\u6570\uFF09\u3002`);
    }
    const conflict = usedPorts.get(binding.port);
    if (conflict) {
      throw new GroupListenerError(
        `\u7B56\u7565\u7EC4\u300C${targetName}\u300D\u7684\u76D1\u542C\u7AEF\u53E3 ${binding.port} \u4E0E${conflict}\u51B2\u7A81\uFF0C\u8BF7\u4FEE\u6539\u540E\u518D\u751F\u6210\u3002`
      );
    }
    usedPorts.set(binding.port, `\u7B56\u7565\u7EC4\u300C${targetName}\u300D\u7684\u76D1\u542C\u7AEF\u53E3`);
    let name = `group-mixed-${autoIndex++}`;
    while (names.has(name)) name = `group-mixed-${autoIndex++}`;
    names.add(name);
    out.push({
      name,
      type: "mixed",
      // 默认仅本机可用；「允许局域网访问」需用户显式开启
      listen: binding.allowLan === true ? "0.0.0.0" : "127.0.0.1",
      port: binding.port,
      proxy: targetName,
      udp: true
    });
  }
  return out;
}

// src/generator/index.ts
function isPlainObject3(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
var BaseConfigYamlError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "BaseConfigYamlError";
  }
};
function formatYamlParseError(error) {
  if (error && typeof error === "object") {
    const record = error;
    const reason = typeof record.reason === "string" ? record.reason : typeof record.message === "string" ? record.message : String(error);
    const line = typeof record.mark?.line === "number" ? record.mark.line + 1 : null;
    const column = typeof record.mark?.column === "number" ? record.mark.column + 1 : null;
    return line && column ? `${reason}\uFF08\u7B2C ${line} \u884C\uFF0C\u7B2C ${column} \u5217\uFF09` : reason;
  }
  return String(error);
}
function parseBaseConfigYaml(configYaml) {
  try {
    const parsed = yaml.load(configYaml);
    if (!isPlainObject3(parsed)) {
      throw new BaseConfigYamlError("\u57FA\u7840\u548C DNS \u914D\u7F6E\u5FC5\u987B\u662F YAML \u5BF9\u8C61\uFF08\u9876\u5C42 key/value \u6620\u5C04\uFF09\uFF0C\u4E0D\u80FD\u662F\u5B57\u7B26\u4E32\u3001\u6570\u7EC4\u3001\u6570\u5B57\u3001\u5E03\u5C14\u503C\u6216 null\u3002");
    }
    return parsed;
  } catch (error) {
    if (error instanceof BaseConfigYamlError) throw error;
    throw new BaseConfigYamlError(`\u57FA\u7840\u548C DNS \u914D\u7F6E YAML \u89E3\u6790\u5931\u8D25\uFF1A${formatYamlParseError(error)}`);
  }
}
var GENERATED_CONFIG_SECTION_KEYS = /* @__PURE__ */ new Set(["proxies", "proxy-groups", "rule-providers", "rules"]);
function assertNoGeneratedSectionsInBaseConfig(baseConfig) {
  const conflicts = [...GENERATED_CONFIG_SECTION_KEYS].filter((key) => baseConfig[key] !== void 0);
  if (conflicts.length === 0) return;
  throw new BaseConfigYamlError(
    `\u57FA\u7840\u548C DNS \u914D\u7F6E\u4E0D\u80FD\u5305\u542B ${conflicts.join(", ")}\uFF1B\u8FD9\u4E9B\u6BB5\u7531 SubBoost \u6839\u636E\u8282\u70B9\u3001\u4EE3\u7406\u7EC4\u548C\u89C4\u5219\u751F\u6210\u3002`
  );
}
function omitGeneratedSections(baseConfig) {
  return Object.fromEntries(
    Object.entries(baseConfig).filter(
      ([key, value]) => value !== void 0 && !GENERATED_CONFIG_SECTION_KEYS.has(key)
    )
  );
}
function normalizeBaseConfigPatch(baseConfig) {
  const patch = omitGeneratedSections(baseConfig);
  const dnsPolicyEntries = collectDnsPolicyEntries(patch["nameserver-policy"]);
  if (dnsPolicyEntries.length === 0) return patch;
  const { ["nameserver-policy"]: _topLevelPolicy, ...withoutTopLevelPolicy } = patch;
  const dns = withoutTopLevelPolicy.dns;
  if (dns !== void 0 && !isPlainObject3(dns)) {
    throw new BaseConfigYamlError("\u57FA\u7840\u548C DNS \u914D\u7F6E\u4E2D\u7684 dns \u5FC5\u987B\u662F\u5BF9\u8C61\uFF0C\u624D\u80FD\u5408\u5E76\u9876\u5C42 nameserver-policy\u3002");
  }
  if (isPlainObject3(dns) && dns["nameserver-policy"] !== void 0) {
    return withoutTopLevelPolicy;
  }
  return {
    ...withoutTopLevelPolicy,
    dns: {
      ...isPlainObject3(dns) ? dns : {},
      "nameserver-policy": Object.fromEntries(dnsPolicyEntries)
    }
  };
}
function ensureUniqueProxyNames(nodes) {
  const used = /* @__PURE__ */ new Set();
  const counter = /* @__PURE__ */ new Map();
  return nodes.map((node) => {
    const baseRaw = typeof node?.name === "string" ? node.name : String(node?.name ?? "");
    const base = baseRaw.trim() || "\u672A\u547D\u540D\u8282\u70B9";
    if (!used.has(base)) {
      used.add(base);
      counter.set(base, 1);
      return base === node.name ? node : { ...node, name: base };
    }
    let i = counter.get(base) || 1;
    let candidate = `${base} (${i + 1})`;
    while (used.has(candidate)) {
      i += 1;
      candidate = `${base} (${i + 1})`;
    }
    counter.set(base, i + 1);
    used.add(candidate);
    return { ...node, name: candidate };
  });
}
function generateClashConfig(options2) {
  const {
    nodes,
    proxyProviders,
    template = "standard",
    userConfig = {},
    dialerProxyGroups = [],
    customProxyGroups = [],
    customRuleSets = [],
    proxyGroupAdvanced = {},
    builtinRuleEdits,
    proxyGroupNameOverrides
  } = options2;
  const config = {
    ...buildDefaultUserConfig(template),
    ...userConfig
  };
  const hasExplicitBaseConfigYaml = typeof userConfig.dnsYaml === "string";
  const resolvedProxyProviders = proxyProviders && typeof proxyProviders === "object" && Object.keys(proxyProviders).length > 0 ? proxyProviders : void 0;
  const proxyProviderNames = resolvedProxyProviders ? Object.keys(resolvedProxyProviders).map((k) => k.trim()).filter(Boolean).sort((a, b) => a.localeCompare(b)) : [];
  const baseConfigYaml = (hasExplicitBaseConfigYaml ? userConfig.dnsYaml : config.dnsYaml) ?? "";
  const baseConfig = baseConfigYaml.trim() ? parseBaseConfigYaml(baseConfigYaml) : {};
  assertNoGeneratedSectionsInBaseConfig(baseConfig);
  const baseConfigRecord = baseConfig;
  const shouldUseDefaultBaseSections = !hasExplicitBaseConfigYaml;
  const baseConfigClientFingerprint = typeof baseConfigRecord["global-client-fingerprint"] === "string" && baseConfigRecord["global-client-fingerprint"].trim() ? String(baseConfigRecord["global-client-fingerprint"]).trim() : void 0;
  const normalizedNodes = nodes.map((node) => {
    if (!node || typeof node !== "object") return node;
    const typed = node;
    const type2 = typeof typed.type === "string" ? typed.type : "";
    const hasClientFingerprint = typeof typed["client-fingerprint"] === "string" && Boolean(String(typed["client-fingerprint"]).trim());
    const supportsClientFingerprint = type2 === "vmess" || type2 === "vless" || type2 === "trojan" || type2 === "anytls";
    const shouldApplyBaseFingerprint = Boolean(baseConfigClientFingerprint) && supportsClientFingerprint && !hasClientFingerprint && (type2 === "trojan" || type2 === "anytls" || typeof typed.tls === "boolean" && typed.tls || type2 === "vless" && Boolean(typed["reality-opts"]));
    const nextBase = shouldApplyBaseFingerprint ? { ...typed, "client-fingerprint": baseConfigClientFingerprint } : typed;
    if (type2 !== "vless") return nextBase;
    return normalizeMihomoVlessForGeneration(nextBase);
  });
  const supportedNodes = normalizedNodes.filter(isMihomoSupportedProxyNode);
  const uniqueNodes = ensureUniqueProxyNames(supportedNodes);
  const sanitizeDialerProxyGroups = (groups, availableNodeNames, availableGroupNames) => {
    const builtinRelays = /* @__PURE__ */ new Set(["DIRECT"]);
    const normalizeList = (list) => {
      const out = [];
      const seen = /* @__PURE__ */ new Set();
      for (const raw of list) {
        const name = typeof raw === "string" ? raw.trim() : "";
        if (!name) continue;
        if (seen.has(name)) continue;
        seen.add(name);
        out.push(name);
      }
      return out;
    };
    return groups.map((g) => {
      const relayNodes = normalizeList(g.relayNodes).filter(
        (n) => builtinRelays.has(n) || availableNodeNames.has(n) || availableGroupNames.has(n)
      );
      const targetNodes = normalizeList(g.targetNodes).filter((n) => availableNodeNames.has(n));
      if (relayNodes.length === 0) {
        return { ...g, relayNodes: [], targetNodes: [] };
      }
      return { ...g, relayNodes, targetNodes };
    });
  };
  const nodeNameSet = new Set(uniqueNodes.map((n) => n.name));
  const activeCustomProxyGroups = customProxyGroups.filter((g) => g && g.enabled !== false);
  const validRelayGroupNames = getValidDialerRelayGroupNames({
    customProxyGroups,
    enabledGroups: config.enabledGroups,
    proxyGroupNameOverrides
  });
  const enabledDialerProxyGroups = dialerProxyGroups.filter((g) => g && g.enabled !== false);
  const sanitizedDialerProxyGroups = enabledDialerProxyGroups.length > 0 ? sanitizeDialerProxyGroups(
    enabledDialerProxyGroups,
    nodeNameSet,
    validRelayGroupNames
  ) : [];
  const allNodes = sanitizedDialerProxyGroups.length > 0 ? applyDialerProxy(uniqueNodes, sanitizedDialerProxyGroups) : uniqueNodes;
  const validDialerProxyNames = /* @__PURE__ */ new Set([
    "DIRECT",
    ...nodeNameSet,
    ...proxyProviderNames,
    ...validRelayGroupNames,
    ...sanitizedDialerProxyGroups.map((g) => g.name.trim()).filter(Boolean)
  ]);
  const outputNodes = allNodes.map((node) => {
    const record = node;
    const dialerProxy = typeof record["dialer-proxy"] === "string" ? record["dialer-proxy"].trim() : "";
    if (!dialerProxy || validDialerProxyNames.has(dialerProxy)) return node;
    const { ["dialer-proxy"]: _dialerProxy, ...withoutDialerProxy } = record;
    return withoutDialerProxy;
  });
  const listeners = (() => {
    const ports = config.listenerPorts;
    if (!ports || typeof ports !== "object") return void 0;
    const usedPorts = /* @__PURE__ */ new Set();
    const out = [];
    let i = 0;
    for (const node of outputNodes) {
      const port = ports[node.name];
      if (typeof port !== "number" || !Number.isInteger(port)) continue;
      if (port < 1 || port > 65535) continue;
      if (usedPorts.has(port)) continue;
      usedPorts.add(port);
      out.push({ name: `mixed${i++}`, type: "mixed", port, proxy: node.name });
    }
    return out.length > 0 ? out : void 0;
  })();
  const dialerGroups = generateDialerProxyGroups(
    sanitizedDialerProxyGroups,
    config.testUrl,
    config.testInterval,
    proxyProviderNames
  );
  const generateOpts = {
    nodes: outputNodes,
    proxyProviderNames,
    enabledModules: config.enabledGroups,
    ruleProviderBaseUrl: config.ruleProviderBaseUrl,
    testUrl: config.testUrl,
    testInterval: config.testInterval,
    customProxyGroups,
    customRuleSets,
    proxyGroupAdvanced,
    builtinRuleEdits,
    cnIpNoResolve: config.cnIpNoResolve,
    experimentalCnUseCnRuleSet: config.experimentalCnUseCnRuleSet,
    proxyGroupNameOverrides
  };
  const defaultBaseConfigPatch = buildDefaultBaseConfigPatch({
    mixedPort: config.mixedPort,
    allowLan: config.allowLan
  });
  const baseTopLevelPatch = shouldUseDefaultBaseSections ? defaultBaseConfigPatch : normalizeBaseConfigPatch(baseConfigRecord);
  const proxyGroups = (() => {
    const allGroups = generateProxyGroups(generateOpts);
    const mergedGroups = (() => {
      if (dialerGroups.length === 0) {
        return allGroups;
      }
      const selectIndex = allGroups.findIndex((g) => g.name === "\u{1F680} \u8282\u70B9\u9009\u62E9");
      const autoIndex = allGroups.findIndex((g) => g.name === "\u26A1 \u81EA\u52A8\u9009\u62E9");
      const insertAfter = Math.max(selectIndex, autoIndex);
      if (insertAfter >= 0) {
        const before = allGroups.slice(0, insertAfter + 1);
        const after = allGroups.slice(insertAfter + 1);
        return [...before, ...dialerGroups, ...after];
      }
      return [...dialerGroups, ...allGroups];
    })();
    const orderKeys = Array.isArray(options2.proxyGroupOrder) ? options2.proxyGroupOrder.filter((k) => typeof k === "string").map((k) => k.trim()).filter(Boolean) : [];
    if (orderKeys.length === 0) {
      return mergedGroups;
    }
    const moduleNameToKey = /* @__PURE__ */ new Map();
    for (const mod of PROXY_GROUP_MODULES) {
      const resolvedName = resolveProxyGroupModuleName(mod, proxyGroupNameOverrides?.[mod.id]);
      moduleNameToKey.set(resolvedName, `module:${mod.id}`);
    }
    const customNameToKey = /* @__PURE__ */ new Map();
    for (const g of activeCustomProxyGroups) {
      const name = typeof g.name === "string" ? g.name.trim() : "";
      if (!name) continue;
      customNameToKey.set(name, `custom:${g.id}`);
    }
    const dialerNameToKey = /* @__PURE__ */ new Map();
    for (const g of sanitizedDialerProxyGroups) {
      const name = typeof g.name === "string" ? g.name.trim() : "";
      if (!name) continue;
      dialerNameToKey.set(name, `dialer:${g.id}`);
    }
    const getKeyByName = (name) => {
      return dialerNameToKey.get(name) || customNameToKey.get(name) || moduleNameToKey.get(name) || `name:${name}`;
    };
    const byKey = /* @__PURE__ */ new Map();
    const defaultKeys = [];
    for (const g of mergedGroups) {
      const key = getKeyByName(g.name);
      defaultKeys.push(key);
      byKey.set(key, g);
    }
    const nextKeys = [];
    const used = /* @__PURE__ */ new Set();
    for (const key of orderKeys) {
      if (used.has(key)) continue;
      const group = byKey.get(key);
      if (!group) continue;
      used.add(key);
      nextKeys.push(key);
    }
    for (const key of defaultKeys) {
      if (used.has(key)) continue;
      used.add(key);
      nextKeys.push(key);
    }
    return nextKeys.map((key) => byKey.get(key)).filter(Boolean);
  })();
  const availablePolicyTargets = withBuiltinPolicyTargets([
    ...proxyGroups.map((group) => group.name),
    ...outputNodes.filter((node) => !isSubscriptionInfoNodeName(node.name)).map((node) => node.name)
  ]);
  const fallbackPolicyTarget = chooseFallbackPolicyTarget(
    [
      proxyGroups[0]?.name,
      outputNodes.find((node) => !isSubscriptionInfoNodeName(node.name))?.name,
      "DIRECT"
    ],
    availablePolicyTargets
  );
  const resolvedListeners = (() => {
    const baseListeners = baseTopLevelPatch.listeners;
    if (baseListeners !== void 0 && !Array.isArray(baseListeners)) {
      throw new BaseConfigYamlError("\u57FA\u7840\u548C DNS \u914D\u7F6E\u4E2D\u7684 listeners \u5FC5\u987B\u662F\u6570\u7EC4\uFF0C\u624D\u80FD\u4E0E\u8282\u70B9\u76D1\u542C\u7AEF\u53E3\u5408\u5E76\u3002");
    }
    const baseListenerArray = Array.isArray(baseListeners) ? baseListeners : [];
    const groupListenerEntries = (() => {
      const bindings = Array.isArray(options2.groupListeners) ? options2.groupListeners : [];
      if (bindings.length === 0) return [];
      const finalGroupNames = new Set(proxyGroups.map((g) => g.name));
      const resolveTarget = (binding) => {
        const target = binding?.target;
        if (!target || typeof target !== "object" || typeof target.id !== "string") {
          return { exists: false, active: false };
        }
        if (target.kind === "module") {
          const mod = PROXY_GROUP_MODULES.find((m) => m.id === target.id);
          if (!mod) return { exists: false, active: false };
          const name = resolveProxyGroupModuleName(mod, proxyGroupNameOverrides?.[mod.id]);
          return { exists: true, active: finalGroupNames.has(name), name };
        }
        if (target.kind === "custom") {
          const group = customProxyGroups.find((g) => g && g.id === target.id);
          if (!group) return { exists: false, active: false };
          const name = typeof group.name === "string" ? group.name.trim() : "";
          return { exists: true, active: group.enabled !== false && finalGroupNames.has(name), name };
        }
        if (target.kind === "dialer") {
          const group = dialerProxyGroups.find((g) => g && g.id === target.id);
          if (!group) return { exists: false, active: false };
          const name = typeof group.name === "string" ? group.name.trim() : "";
          return { exists: true, active: group.enabled !== false && finalGroupNames.has(name), name };
        }
        return { exists: false, active: false };
      };
      const patchMixedPort = baseTopLevelPatch["mixed-port"];
      const effectiveMixedPort = typeof patchMixedPort === "number" ? patchMixedPort : void 0;
      const collectPorts = (list) => (list ?? []).map((l) => l && typeof l === "object" ? l.port : void 0).filter((p) => typeof p === "number");
      const collectNames = (list) => (list ?? []).map((l) => l && typeof l === "object" && typeof l.name === "string" ? l.name : "").filter(Boolean);
      return resolveGroupListenerEntries({
        bindings,
        resolveTarget,
        effectiveMixedPort,
        nodeListenerPorts: listeners ? listeners.map((l) => l.port) : [],
        baseListenerPorts: collectPorts(baseListenerArray),
        usedNames: /* @__PURE__ */ new Set([
          ...listeners ? listeners.map((l) => l.name) : [],
          ...collectNames(baseListenerArray)
        ])
      });
    })();
    const generatedListeners = [
      ...listeners ?? [],
      ...groupListenerEntries
    ];
    if (generatedListeners.length === 0) return baseListeners;
    if (baseListeners === void 0) return generatedListeners;
    return [...baseListenerArray, ...generatedListeners];
  })();
  const mergedProxyProviders = (() => {
    const baseProxyProviders = baseTopLevelPatch["proxy-providers"];
    if (!resolvedProxyProviders) return baseProxyProviders;
    if (baseProxyProviders === void 0) return resolvedProxyProviders;
    if (isPlainObject3(baseProxyProviders)) return { ...baseProxyProviders, ...resolvedProxyProviders };
    throw new BaseConfigYamlError("\u57FA\u7840\u548C DNS \u914D\u7F6E\u4E2D\u7684 proxy-providers \u5FC5\u987B\u662F\u5BF9\u8C61\uFF0C\u624D\u80FD\u4E0E URL \u6E90 proxy-providers \u5408\u5E76\u3002");
  })();
  const clashConfig = {
    // 基础配置 patch：显式 YAML 按用户输入透传；未传入 YAML 时补默认基础段。
    ...baseTopLevelPatch,
    ...resolvedListeners !== void 0 ? { listeners: resolvedListeners } : {},
    // 代理节点
    proxies: outputNodes,
    ...mergedProxyProviders !== void 0 ? { "proxy-providers": mergedProxyProviders } : {},
    // 代理组（按顺序：节点选择→自动选择→中转组→广告→服务→直连→非中国→漏网之鱼）
    "proxy-groups": proxyGroups,
    // 规则提供者（包含自定义分流组的规则）
    "rule-providers": {
      ...generateRuleProviders(generateOpts)
    },
    // 规则（包含自定义分流组的规则）
    rules: generateRules({
      ...generateOpts,
      customRules: config.customRules,
      ruleOrder: config.ruleOrder,
      availablePolicyTargets,
      fallbackPolicyTarget
    })
  };
  return clashConfig;
}
function generateClashYaml(options2) {
  const config = generateClashConfig(options2);
  return configToYaml(config);
}

// src/json.ts
function isRecord2(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
function tryParseJson(text) {
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch (error) {
    return { ok: false, error };
  }
}
function safeParseJson(text, fallback) {
  const parsed = tryParseJson(text);
  return parsed.ok ? parsed.value : fallback;
}
function safeParseJsonObject(text) {
  const parsed = safeParseJson(text, null);
  return isRecord2(parsed) ? parsed : null;
}

// src/node-name-template.ts
var DEFAULT_NODE_NAME_TEMPLATE = "[{tag}]{name}";
function formatNodeNameFromTemplate(params) {
  const originName = params.originName.trim();
  if (!originName) return "";
  const tag = typeof params.tag === "string" ? params.tag.trim() : "";
  if (!tag) return originName;
  const template = typeof params.template === "string" ? params.template.trim() : "";
  const pattern = template || DEFAULT_NODE_NAME_TEMPLATE;
  const formatted = pattern.replaceAll("{tag}", tag).replaceAll("{name}", originName).trim();
  return formatted || originName;
}

// src/parser/base64.ts
function safeDecodeURIComponentForBase64(input) {
  try {
    return decodeURIComponent(input);
  } catch {
    return input;
  }
}
function normalizeBase64(input) {
  let base642 = safeDecodeURIComponentForBase64(input);
  base642 = base642.replace(/\s/g, "");
  base642 = base642.replace(/-/g, "+").replace(/_/g, "/");
  const padding = (4 - base642.length % 4) % 4;
  base642 += "=".repeat(padding);
  return base642;
}
function base64ToBytes(base642) {
  if (typeof Buffer !== "undefined") {
    return Uint8Array.from(Buffer.from(base642, "base64"));
  }
  if (typeof atob !== "function") {
    throw new Error("\u5F53\u524D\u73AF\u5883\u4E0D\u652F\u6301 Base64 \u89E3\u7801");
  }
  const binary2 = atob(base642);
  const bytes = new Uint8Array(binary2.length);
  for (let i = 0; i < binary2.length; i += 1) {
    bytes[i] = binary2.charCodeAt(i);
  }
  return bytes;
}
function bytesToUtf8(bytes) {
  if (typeof TextDecoder === "function") {
    return new TextDecoder("utf-8", { fatal: false }).decode(bytes);
  }
  let out = "";
  for (let i = 0; i < bytes.length; i += 1) out += String.fromCharCode(bytes[i]);
  return out;
}
function decodeBase64(str2) {
  try {
    const base642 = normalizeBase64(str2);
    const bytes = base64ToBytes(base642);
    return bytesToUtf8(bytes);
  } catch {
    throw new Error("\u65E0\u6548\u7684 Base64 \u7F16\u7801");
  }
}
function safeDecodeBase64(str2) {
  try {
    return decodeBase64(str2);
  } catch {
    return null;
  }
}
function encodeBase64(str2) {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(str2, "utf8").toString("base64");
  }
  if (typeof TextEncoder !== "function" || typeof btoa !== "function") {
    throw new Error("\u5F53\u524D\u73AF\u5883\u4E0D\u652F\u6301 Base64 \u7F16\u7801");
  }
  const bytes = new TextEncoder().encode(str2);
  let binary2 = "";
  for (let i = 0; i < bytes.length; i += 1) binary2 += String.fromCharCode(bytes[i]);
  return btoa(binary2);
}
function parseBase64(content) {
  const decoded = decodeBase64(content);
  if (/[\x00-\x08\x0E-\x1F]/.test(decoded)) {
    throw new Error("\u89E3\u7801\u7ED3\u679C\u5305\u542B\u65E0\u6548\u5B57\u7B26\uFF0C\u53EF\u80FD\u4E0D\u662F\u6587\u672C\u5185\u5BB9");
  }
  return decoded;
}

// src/parser/yaml-scalars.ts
var YamlInteger = class extends Number {
  // Number's native tag keeps js-yaml's mapping-key semantics unchanged.
  constructor(text, number) {
    super(number);
    this.text = text;
    this.number = number;
  }
};
var standardInteger = yaml.DEFAULT_SCHEMA.implicit.find((type2) => type2.tag === "tag:yaml.org,2002:int");
var integerType = new yaml.Type("tag:yaml.org,2002:int", {
  kind: "scalar",
  resolve: (value) => standardInteger.resolve(value),
  construct: (value) => new YamlInteger(value, standardInteger.construct(value))
});
var scalarSchema = yaml.DEFAULT_SCHEMA.extend({ implicit: [integerType] });
function integerText(text) {
  const plain = text.replace(/_/g, "");
  if (/^[+-]?\d+$/.test(plain)) return plain;
  const negative = plain.startsWith("-");
  const unsigned = plain.replace(/^[+-]/, "");
  return `${negative ? "-" : ""}${BigInt(unsigned).toString(10)}`;
}
function loadSubscriptionYaml(content) {
  const parsed = yaml.load(content, { schema: scalarSchema });
  const seen = /* @__PURE__ */ new WeakMap();
  const normalize = (value, field = "") => {
    if (value instanceof YamlInteger) {
      return MIHOMO_STRING_SCALAR_FIELDS.has(field) ? integerText(value.text) : value.number;
    }
    if (!value || typeof value !== "object") return value;
    if (value instanceof Date || value instanceof Uint8Array) return value;
    if (seen.has(value)) return seen.get(value);
    if (Array.isArray(value)) {
      const out2 = [];
      seen.set(value, out2);
      for (const item of value) out2.push(normalize(item));
      return out2;
    }
    const out = {};
    seen.set(value, out);
    for (const [key, child] of Object.entries(value)) {
      Object.defineProperty(out, key, { value: normalize(child, key), enumerable: true, writable: true, configurable: true });
    }
    return out;
  };
  return normalize(parsed);
}

// src/parser/canonical-fields.ts
var CLIENT_FINGERPRINT_TYPES = ["vmess", "vless", "trojan", "anytls", "trusttunnel"];
var PACKET_ENCODING_TYPES = ["vmess", "vless"];
var GRPC_SERVICE_NAME_TYPES = ["vmess", "vless", "trojan"];
var PROTOCOL_FIELD_ALIAS_RULES = [
  {
    types: ["vless"],
    canonical: ["reality-opts", "public-key"],
    aliases: [
      ["reality-opts", "pbk"],
      ["reality-opts", "publicKey"],
      ["reality-opts", "public_key"],
      ["pbk"],
      ["public-key"],
      ["publicKey"],
      ["public_key"]
    ]
  },
  {
    types: ["vless"],
    canonical: ["reality-opts", "short-id"],
    aliases: [
      ["reality-opts", "sid"],
      ["reality-opts", "shortId"],
      ["reality-opts", "short_id"],
      ["sid"],
      ["short-id"],
      ["shortId"],
      ["short_id"],
      ["shortid"]
    ]
  },
  {
    types: CLIENT_FINGERPRINT_TYPES,
    canonical: ["client-fingerprint"],
    aliases: [["fp"], ["fingerprint"], ["clientFingerprint"]]
  },
  {
    types: PACKET_ENCODING_TYPES,
    canonical: ["packet-encoding"],
    aliases: [["packetEncoding"], ["packet_encoding"], ["packetencoding"]]
  },
  {
    types: GRPC_SERVICE_NAME_TYPES,
    canonical: ["grpc-opts", "grpc-service-name"],
    aliases: [
      ["grpc-opts", "serviceName"],
      ["grpc-opts", "service_name"],
      ["grpc-opts", "service-name"],
      ["serviceName"],
      ["service_name"],
      ["service-name"],
      ["servicename"],
      ["grpc-service-name"]
    ]
  },
  {
    types: ["wireguard"],
    canonical: ["private-key"],
    aliases: [["privatekey"], ["privateKey"], ["private_key"]]
  },
  {
    types: ["wireguard"],
    canonical: ["public-key"],
    aliases: [["publickey"], ["publicKey"], ["public_key"], ["peer-public-key"], ["peerPublicKey"]]
  },
  {
    types: ["wireguard"],
    canonical: ["pre-shared-key"],
    aliases: [["presharedkey"], ["preshared-key"], ["preSharedKey"], ["pre_shared_key"], ["psk"]]
  }
];
function isRecord3(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
function hasValue(value) {
  if (value === void 0 || value === null) return false;
  return typeof value !== "string" || value.trim().length > 0;
}
function pathEquals(a, b) {
  return a.length === b.length && a.every((item, index) => item === b[index]);
}
function getPath(record, path) {
  let current = record;
  for (const key of path) {
    if (!isRecord3(current)) return void 0;
    current = current[key];
  }
  return current;
}
function ensureParent(record, path) {
  let current = record;
  for (const key of path.slice(0, -1)) {
    const next = current[key];
    if (isRecord3(next)) {
      const cloned = { ...next };
      current[key] = cloned;
      current = cloned;
      continue;
    }
    const created = {};
    current[key] = created;
    current = created;
  }
  return current;
}
function setPath(record, path, value) {
  const parent = ensureParent(record, path);
  const key = path[path.length - 1];
  if (!parent || !key) return;
  parent[key] = value;
}
function deletePath(record, path) {
  let current = record;
  for (const key of path.slice(0, -1)) {
    if (!isRecord3(current)) return;
    current = current[key];
  }
  if (!isRecord3(current)) return;
  delete current[path[path.length - 1]];
}
function pickAliasValue(record, aliases) {
  for (const path of aliases) {
    const value = getPath(record, path);
    if (hasValue(value)) return value;
  }
  return void 0;
}
function ruleApplies(rule, type2) {
  return !rule.types || rule.types.includes(type2);
}
function normalizeTlsVerification(value) {
  if (typeof value === "boolean") return !value;
  if (typeof value !== "string") return void 0;
  const normalized = value.trim().toLowerCase();
  if (["0", "false", "no", "off"].includes(normalized)) return true;
  if (["1", "true", "yes", "on"].includes(normalized)) return false;
  return void 0;
}
function canonicalizeSkipCertVerify(record) {
  if (hasValue(record["skip-cert-verify"])) return;
  const direct = pickAliasValue(record, [
    ["allowInsecure"],
    ["allow_insecure"],
    ["allow-insecure"],
    ["allowinsecure"],
    ["insecure"]
  ]);
  if (hasValue(direct)) {
    record["skip-cert-verify"] = direct;
    for (const key of ["allowInsecure", "allow_insecure", "allow-insecure", "allowinsecure", "insecure"]) {
      delete record[key];
    }
    return;
  }
  const tlsVerification = normalizeTlsVerification(record["tls-verification"]);
  if (tlsVerification !== void 0) {
    record["skip-cert-verify"] = tlsVerification;
    delete record["tls-verification"];
  }
}
function canonicalizeParsedNode(node) {
  if (!isRecord3(node)) return node;
  const type2 = typeof node.type === "string" ? node.type.trim().toLowerCase() : "";
  const out = { ...node };
  const hasCertificateFingerprint = normalizeCertificateFingerprint(out.fingerprint) !== null;
  for (const rule of PROTOCOL_FIELD_ALIAS_RULES) {
    if (!ruleApplies(rule, type2)) continue;
    const aliases = hasCertificateFingerprint ? rule.aliases.filter((alias) => !pathEquals(alias, ["fingerprint"])) : rule.aliases;
    const value = pickAliasValue(out, [rule.canonical, ...aliases]);
    if (!hasValue(value)) continue;
    setPath(out, rule.canonical, value);
    for (const alias of aliases) {
      if (!pathEquals(alias, rule.canonical)) deletePath(out, alias);
    }
  }
  canonicalizeSkipCertVerify(out);
  return out;
}

// src/parser/port-spec.ts
function normalizePortsSpec(value) {
  return value.trim().replace(/[;/]/g, ",").replace(/\s+/g, "");
}
function normalizePortsSpecValue(value) {
  if (typeof value === "number" && Number.isInteger(value)) {
    const normalized2 = normalizePortsSpec(String(value));
    return normalized2 || void 0;
  }
  if (typeof value !== "string") return void 0;
  const normalized = normalizePortsSpec(value);
  return normalized || void 0;
}
function parsePortNumber(value) {
  const port = typeof value === "number" && Number.isInteger(value) ? value : typeof value === "string" && /^\d+$/.test(value.trim()) ? Number.parseInt(value.trim(), 10) : void 0;
  if (port === void 0) return void 0;
  return port >= 1 && port <= 65535 ? port : void 0;
}
function pickStablePortFromPorts(ports) {
  const normalized = normalizePortsSpec(ports);
  const parts = normalized.split(",").map((p) => p.trim()).filter(Boolean);
  const segments = [];
  for (const part of parts) {
    if (/^\d+$/.test(part)) {
      const p = Number.parseInt(part, 10);
      if (Number.isInteger(p) && p >= 1 && p <= 65535) segments.push({ kind: "port", port: p });
      continue;
    }
    const range = part.match(/^(\d+)-(\d+)$/);
    if (range) {
      const from = Number.parseInt(range[1], 10);
      const to = Number.parseInt(range[2], 10);
      if (Number.isInteger(from) && Number.isInteger(to) && from >= 1 && to <= 65535 && from <= to) {
        segments.push({ kind: "range", from, to });
      }
    }
  }
  const includes443 = segments.some(
    (seg) => seg.kind === "port" ? seg.port === 443 : seg.from <= 443 && 443 <= seg.to
  );
  if (includes443) return 443;
  const first = segments[0];
  if (!first) return 443;
  return first.kind === "port" ? first.port : first.from;
}

// src/parser/protocols/url-decode.ts
function safeDecodeURIComponent(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
var URL_SCHEME_RE = /^([a-zA-Z][a-zA-Z0-9+.-]*):\/\//;
function parseUrlWithNeutralScheme(value) {
  const schemeMatch = URL_SCHEME_RE.exec(value);
  if (!schemeMatch) {
    throw new TypeError("Invalid URL");
  }
  const protocol = `${schemeMatch[1].toLowerCase()}:`;
  let rest = value.slice(schemeMatch[0].length);
  let hash = "";
  const hashIndex = rest.indexOf("#");
  if (hashIndex !== -1) {
    hash = rest.slice(hashIndex);
    rest = rest.slice(0, hashIndex);
  }
  let search = "";
  const queryIndex = rest.indexOf("?");
  if (queryIndex !== -1) {
    search = rest.slice(queryIndex);
    rest = rest.slice(0, queryIndex);
  }
  let pathname = "";
  let authority = rest;
  const pathIndex = rest.indexOf("/");
  if (pathIndex !== -1) {
    authority = rest.slice(0, pathIndex);
    pathname = rest.slice(pathIndex);
  }
  let userInfo = "";
  let hostPort = authority;
  const atIndex = authority.lastIndexOf("@");
  if (atIndex !== -1) {
    userInfo = authority.slice(0, atIndex);
    hostPort = authority.slice(atIndex + 1);
  }
  let username = "";
  let password = "";
  if (userInfo) {
    const userInfoColonIndex = userInfo.indexOf(":");
    if (userInfoColonIndex === -1) {
      username = userInfo;
    } else {
      username = userInfo.slice(0, userInfoColonIndex);
      password = userInfo.slice(userInfoColonIndex + 1);
    }
  }
  let hostname = "";
  let port = "";
  if (hostPort.startsWith("[")) {
    const ipv6End = hostPort.indexOf("]");
    if (ipv6End === -1) {
      throw new TypeError("Invalid URL");
    }
    hostname = hostPort.slice(1, ipv6End);
    const afterIpv6 = hostPort.slice(ipv6End + 1);
    if (afterIpv6.startsWith(":")) {
      port = afterIpv6.slice(1);
    } else if (afterIpv6.length > 0) {
      throw new TypeError("Invalid URL");
    }
  } else {
    const lastColonIndex = hostPort.lastIndexOf(":");
    const hasSingleColon = lastColonIndex !== -1 && hostPort.indexOf(":") === lastColonIndex;
    if (hasSingleColon) {
      hostname = hostPort.slice(0, lastColonIndex);
      port = hostPort.slice(lastColonIndex + 1);
    } else {
      hostname = hostPort;
    }
  }
  return {
    protocol,
    username,
    password,
    hostname,
    port,
    pathname,
    search,
    hash,
    searchParams: new URLSearchParams(search.startsWith("?") ? search.slice(1) : search)
  };
}
function safeDecodeFormUrlEncoded(value) {
  if (!value) return value;
  const normalized = value.replace(/\+/g, "%20");
  try {
    return decodeURIComponent(normalized);
  } catch {
    return safeDecodeURIComponent(value);
  }
}

// src/parser/json-utils.ts
function parseJsonObject(text) {
  return safeParseJsonObject(text);
}
function parseJsonStringMap(text) {
  const parsed = parseJsonObject(text);
  if (!parsed) return void 0;
  const out = {};
  for (const [key, value] of Object.entries(parsed)) {
    const normalizedKey = key.trim();
    if (!normalizedKey) continue;
    if (typeof value === "string") out[normalizedKey] = value;
    else if (typeof value === "number" || typeof value === "boolean") out[normalizedKey] = String(value);
  }
  return Object.keys(out).length > 0 ? out : void 0;
}

// src/parser/protocols/ss.ts
function splitSsPluginParam(input) {
  const out = [];
  let current = "";
  for (let i = 0; i < input.length; i += 1) {
    const ch = input[i];
    if (ch === "\\") {
      const next = input[i + 1];
      if (next === ";" || next === "=" || next === "\\") {
        current += next;
        i += 1;
        continue;
      }
      if (next !== void 0) {
        current += `\\${next}`;
        i += 1;
        continue;
      }
      current += "\\";
      continue;
    }
    if (ch === ";") {
      out.push(current);
      current = "";
      continue;
    }
    current += ch;
  }
  out.push(current);
  return out;
}
function normalizeSsPlugin(plugin, pluginOpts) {
  const rawPlugin = (plugin ?? "").trim();
  if (!rawPlugin) return { plugin: void 0, pluginOpts: void 0 };
  const normalizedName = rawPlugin.toLowerCase();
  const opts = pluginOpts && typeof pluginOpts === "object" ? pluginOpts : void 0;
  const isObfs = normalizedName === "obfs" || normalizedName === "obfs-local" || normalizedName === "simple-obfs";
  if (!isObfs) {
    const boolish = (value) => {
      if (typeof value === "boolean") return value;
      if (typeof value === "number" && Number.isFinite(value)) {
        if (value === 0) return false;
        if (value === 1) return true;
        return void 0;
      }
      if (typeof value !== "string") return void 0;
      const s = value.trim().toLowerCase();
      if (!s) return void 0;
      if (s === "0" || s === "false" || s === "off" || s === "no") return false;
      if (s === "1" || s === "true" || s === "on" || s === "yes") return true;
      return void 0;
    };
    const isV2rayPlugin = normalizedName === "v2ray-plugin" || normalizedName === "xray-plugin";
    const isGostPlugin = normalizedName === "gost-plugin";
    if (!isV2rayPlugin && !isGostPlugin) {
      return { plugin: rawPlugin, pluginOpts };
    }
    if (!opts) {
      return { plugin: normalizedName, pluginOpts };
    }
    const nextOpts2 = { ...opts };
    for (const key of ["mux", "tls"]) {
      const b = boolish(nextOpts2[key]);
      if (b !== void 0) nextOpts2[key] = b;
    }
    return {
      plugin: normalizedName,
      pluginOpts: nextOpts2
    };
  }
  const pickString4 = (value) => typeof value === "string" ? value.trim() : "";
  const mode = pickString4(opts?.mode) || pickString4(opts?.obfs);
  const host = pickString4(opts?.host) || pickString4(opts?.["obfs-host"]) || pickString4(opts?.["obfs_host"]);
  const nextOpts = {};
  if (mode) nextOpts.mode = mode;
  if (host) nextOpts.host = host;
  return {
    plugin: "obfs",
    pluginOpts: Object.keys(nextOpts).length > 0 ? nextOpts : void 0
  };
}
function parseBoolish2(value) {
  if (value === null) return void 0;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return true;
  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;
  return void 0;
}
function parseV2rayPluginJsonParam(value) {
  const raw = value.trim();
  if (!raw) return void 0;
  const decoded = safeDecodeBase64(raw) ?? raw;
  return parseJsonObject(decoded) ?? void 0;
}
function parseSS(uri) {
  if (!uri.startsWith("ss://")) {
    throw new Error("\u65E0\u6548\u7684 SS \u94FE\u63A5");
  }
  const content = uri.slice(5);
  const hashIndex = content.indexOf("#");
  let name = "SS \u8282\u70B9";
  let mainPart = content;
  if (hashIndex !== -1) {
    name = safeDecodeFormUrlEncoded(content.slice(hashIndex + 1));
    mainPart = content.slice(0, hashIndex);
  }
  const queryIndex = mainPart.indexOf("?");
  let plugin;
  let pluginOpts;
  let queryParams;
  if (queryIndex !== -1) {
    const queryString = mainPart.slice(queryIndex + 1);
    mainPart = mainPart.slice(0, queryIndex);
    queryParams = new URLSearchParams(queryString);
    const pluginParam = queryParams.get("plugin");
    if (pluginParam) {
      const segments = splitSsPluginParam(pluginParam);
      const [pluginName, ...optsParts] = segments;
      plugin = pluginName?.trim();
      if (optsParts.length > 0) {
        pluginOpts = {};
        for (const part of optsParts) {
          const trimmed = part.trim();
          if (!trimmed) continue;
          const eqIndex = trimmed.indexOf("=");
          if (eqIndex !== -1) {
            const key = trimmed.slice(0, eqIndex).trim();
            const value = trimmed.slice(eqIndex + 1).trim();
            if (key) pluginOpts[key] = value || true;
          } else {
            pluginOpts[trimmed] = true;
          }
        }
        if (Object.keys(pluginOpts).length === 0) {
          pluginOpts = void 0;
        }
      }
    }
    if (!plugin) {
      const v2rayPluginParam = queryParams.get("v2ray-plugin");
      const v2rayPluginOpts = v2rayPluginParam ? parseV2rayPluginJsonParam(v2rayPluginParam) : void 0;
      if (v2rayPluginOpts) {
        plugin = "v2ray-plugin";
        pluginOpts = v2rayPluginOpts;
      }
    }
  }
  let server;
  let port;
  let cipher;
  let password;
  const atIndex = mainPart.lastIndexOf("@");
  if (atIndex !== -1) {
    const userInfo = safeDecodeURIComponent(mainPart.slice(0, atIndex));
    const serverPart = mainPart.slice(atIndex + 1);
    const colonIndex = serverPart.lastIndexOf(":");
    if (colonIndex === -1) {
      throw new Error("\u65E0\u6CD5\u89E3\u6790\u670D\u52A1\u5668\u7AEF\u53E3");
    }
    server = serverPart.slice(0, colonIndex);
    port = parseInt(serverPart.slice(colonIndex + 1), 10);
    let decoded;
    if (userInfo.includes(":")) {
      decoded = userInfo;
    } else {
      decoded = decodeBase64(userInfo);
    }
    const methodPasswordIndex = decoded.indexOf(":");
    if (methodPasswordIndex === -1) {
      throw new Error("\u65E0\u6CD5\u89E3\u6790\u52A0\u5BC6\u65B9\u5F0F\u548C\u5BC6\u7801");
    }
    cipher = decoded.slice(0, methodPasswordIndex);
    password = decoded.slice(methodPasswordIndex + 1);
  } else {
    let decoded;
    try {
      decoded = decodeBase64(safeDecodeURIComponent(mainPart));
    } catch {
      throw new Error("\u65E0\u6CD5\u89E3\u7801 SS \u94FE\u63A5");
    }
    const methodPasswordAtIndex = decoded.lastIndexOf("@");
    if (methodPasswordAtIndex === -1) {
      throw new Error("\u65E0\u6548\u7684 SS \u94FE\u63A5\u683C\u5F0F");
    }
    const methodPassword = decoded.slice(0, methodPasswordAtIndex);
    const serverPort = decoded.slice(methodPasswordAtIndex + 1);
    const methodIndex = methodPassword.indexOf(":");
    if (methodIndex === -1) {
      throw new Error("\u65E0\u6CD5\u89E3\u6790\u52A0\u5BC6\u65B9\u5F0F\u548C\u5BC6\u7801");
    }
    cipher = methodPassword.slice(0, methodIndex);
    password = methodPassword.slice(methodIndex + 1);
    const colonIndex = serverPort.lastIndexOf(":");
    if (colonIndex === -1) {
      throw new Error("\u65E0\u6CD5\u89E3\u6790\u670D\u52A1\u5668\u7AEF\u53E3");
    }
    server = serverPort.slice(0, colonIndex);
    port = parseInt(serverPort.slice(colonIndex + 1), 10);
  }
  if (server.startsWith("[") && server.endsWith("]")) {
    server = server.slice(1, -1);
  }
  if (isNaN(port) || port <= 0 || port > 65535) {
    throw new Error("\u65E0\u6548\u7684\u7AEF\u53E3\u53F7");
  }
  const node = {
    name,
    type: "ss",
    server,
    port,
    cipher,
    password,
    udp: true
  };
  if (plugin) {
    const normalized = normalizeSsPlugin(plugin, pluginOpts);
    if (normalized.plugin) node.plugin = normalized.plugin;
    if (normalized.pluginOpts) node["plugin-opts"] = normalized.pluginOpts;
  }
  if (queryParams) {
    const udpOverTcp = parseBoolish2(queryParams.get("uot"));
    const tfo = parseBoolish2(queryParams.get("tfo"));
    if (udpOverTcp) node["udp-over-tcp"] = true;
    if (tfo) node.tfo = true;
  }
  return node;
}

// src/parser/clash-yaml.ts
function applyWsEarlyDataInPlace(node) {
  if (String(node.network ?? "") !== "ws") return;
  const wsOpts = node["ws-opts"];
  if (!wsOpts || typeof wsOpts !== "object" || Array.isArray(wsOpts)) return;
  const record = wsOpts;
  const path = typeof record.path === "string" ? record.path.trim() : "";
  if (!path) return;
  const { path: wsPath, earlyData } = splitWsPathEarlyData(path);
  if (earlyData === void 0) return;
  record.path = wsPath;
  if (record["max-early-data"] !== void 0 || record["early-data-header-name"] !== void 0) return;
  record["early-data-header-name"] = "Sec-WebSocket-Protocol";
  record["max-early-data"] = earlyData;
}
function normalizeClashYamlScalarText(content) {
  return content.replace(
    /^(\s*short-id\s*:\s*)([0-9]+)(\s*(?:#.*)?)$/gm,
    (_match, prefix, value, suffix) => `${prefix}"${value}"${suffix || ""}`
  );
}
function countLeadingSpaces(line) {
  let count = 0;
  while (count < line.length && line.charCodeAt(count) === 32) count += 1;
  return count;
}
function isRootProxiesKey(trimmed) {
  if (trimmed === "proxies:") return true;
  if (!trimmed.startsWith("proxies:")) return false;
  return trimmed.slice("proxies:".length).trimStart().startsWith("#");
}
function isSingleLineFlowSequenceItem(trimmed) {
  if (!trimmed.startsWith("- {")) return false;
  const closingBrace = trimmed.lastIndexOf("}");
  if (closingBrace < 3) return false;
  const trailing = trimmed.slice(closingBrace + 1).trim();
  return !trailing || trailing.startsWith("#");
}
function repairRootFlowProxyListIndent(input) {
  const lines = input.split(/\r?\n/);
  let rootMappingIndent = Number.POSITIVE_INFINITY;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("-")) continue;
    const colonIndex = trimmed.indexOf(":");
    if (colonIndex <= 0) continue;
    rootMappingIndent = Math.min(rootMappingIndent, countLeadingSpaces(line));
  }
  if (rootMappingIndent === Number.POSITIVE_INFINITY) return input;
  const proxiesLineIndex = lines.findIndex((line) => {
    const trimmed = line.trim();
    return countLeadingSpaces(line) === rootMappingIndent && isRootProxiesKey(trimmed);
  });
  if (proxiesLineIndex < 0) return input;
  const itemIndexes = [];
  for (let index = proxiesLineIndex + 1; index < lines.length; index += 1) {
    const line = lines[index];
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const indent = countLeadingSpaces(line);
    if (!trimmed.startsWith("-") && indent <= rootMappingIndent) break;
    if (indent < rootMappingIndent || !isSingleLineFlowSequenceItem(trimmed)) return input;
    itemIndexes.push(index);
  }
  if (itemIndexes.length < 2) return input;
  const canonicalIndent = countLeadingSpaces(lines[itemIndexes[0]]);
  if (itemIndexes.every((index) => countLeadingSpaces(lines[index]) === canonicalIndent)) return input;
  for (const index of itemIndexes) {
    lines[index] = `${" ".repeat(canonicalIndent)}${lines[index].trimStart()}`;
  }
  return lines.join("\n");
}
function repairInlineListIndent(input) {
  const lines = input.split(/\r?\n/);
  const out = [];
  for (let index = 0; index < lines.length; ) {
    const line = lines[index];
    const match = line.match(/^(\s*)-\s*(name\s*:\s*.+)$/);
    if (!match) {
      out.push(line);
      index += 1;
      continue;
    }
    const dashIndent = match[1].length;
    const keyIndent = dashIndent + 2;
    let minIndent = Number.POSITIVE_INFINITY;
    let blockEnd = index + 1;
    while (blockEnd < lines.length) {
      const nextLine = lines[blockEnd];
      const trimmed = nextLine.trim();
      if (!trimmed || trimmed.startsWith("#")) {
        blockEnd += 1;
        continue;
      }
      const indent = countLeadingSpaces(nextLine);
      if (indent <= dashIndent) break;
      minIndent = Math.min(minIndent, indent);
      blockEnd += 1;
    }
    if (minIndent !== Number.POSITIVE_INFINITY && minIndent > keyIndent) {
      out.push(`${" ".repeat(dashIndent)}-`);
      out.push(`${" ".repeat(minIndent)}${match[2]}`);
    } else {
      out.push(line);
    }
    out.push(...lines.slice(index + 1, blockEnd));
    index = blockEnd;
  }
  return out.join("\n");
}
function parseClashYaml(content) {
  const nodes = [];
  const errors = [];
  try {
    const normalizeTabs = (s) => s.replace(/\t/g, "  ");
    const tryLoad = loadSubscriptionYaml;
    const normalizedContent = normalizeClashYamlScalarText(normalizeTabs(content));
    let parsed;
    try {
      parsed = tryLoad(normalizedContent);
    } catch (e) {
      const repaired = repairRootFlowProxyListIndent(repairInlineListIndent(normalizedContent));
      parsed = tryLoad(repaired);
    }
    if (!parsed) {
      return {
        nodes: [],
        errors: ["\u7A7A\u7684\u914D\u7F6E\u6587\u4EF6"],
        totalParsed: 0,
        totalFailed: 1
      };
    }
    if (typeof parsed === "object" && !Array.isArray(parsed)) {
      const config = parsed;
      if (config.proxies && Array.isArray(config.proxies)) {
        for (const proxy of config.proxies) {
          try {
            const node = normalizeNode(proxy);
            if (node) nodes.push(canonicalizeParsedNode(node));
          } catch (e) {
            errors.push(
              `\u8282\u70B9 "${proxy?.name || "\u672A\u77E5"}" \u89E3\u6790\u5931\u8D25: ${e instanceof Error ? e.message : "\u672A\u77E5\u9519\u8BEF"}`
            );
          }
        }
      } else {
        try {
          const node = normalizeNode(config);
          if (node) nodes.push(canonicalizeParsedNode(node));
        } catch (e) {
          errors.push(`\u8282\u70B9\u89E3\u6790\u5931\u8D25: ${e instanceof Error ? e.message : "\u672A\u77E5\u9519\u8BEF"}`);
        }
      }
      const proxyProviders = config["proxy-providers"];
      const hasProxyProviders = proxyProviders && typeof proxyProviders === "object" && !Array.isArray(proxyProviders) && Object.keys(proxyProviders).length > 0;
      if (hasProxyProviders) {
        errors.push(
          "\u68C0\u6D4B\u5230 proxy-providers \u914D\u7F6E\uFF0C\u7531\u4E8E\u6D4F\u89C8\u5668\u9650\u5236\u65E0\u6CD5\u81EA\u52A8\u62C9\u53D6\uFF0C\u8BF7\u76F4\u63A5\u7C98\u8D34\u8282\u70B9\u5185\u5BB9"
        );
      }
    } else if (Array.isArray(parsed)) {
      for (const proxy of parsed) {
        if (!proxy || typeof proxy !== "object") continue;
        try {
          const node = normalizeNode(proxy);
          if (node) nodes.push(canonicalizeParsedNode(node));
        } catch (e) {
          const name = proxy?.name || "\u672A\u77E5";
          errors.push(`\u8282\u70B9 "${name}" \u89E3\u6790\u5931\u8D25: ${e instanceof Error ? e.message : "\u672A\u77E5\u9519\u8BEF"}`);
        }
      }
    } else {
      errors.push("\u65E0\u6CD5\u8BC6\u522B\u4E3A Clash YAML\uFF08\u7F3A\u5C11 proxies \u6216\u8282\u70B9\u5B57\u6BB5\uFF09");
    }
    return {
      nodes,
      errors,
      totalParsed: nodes.length,
      totalFailed: errors.length
    };
  } catch (e) {
    return {
      nodes: [],
      errors: [`YAML \u89E3\u6790\u9519\u8BEF: ${e instanceof Error ? e.message : "\u672A\u77E5\u9519\u8BEF"}`],
      totalParsed: 0,
      totalFailed: 1
    };
  }
}
function normalizeNode(proxy) {
  if (!proxy || typeof proxy !== "object") {
    return null;
  }
  const typeRaw = typeof proxy.type === "string" ? proxy.type : String(proxy.type ?? "");
  const type2 = typeRaw.trim().toLowerCase();
  if (!type2) {
    throw new Error("\u7F3A\u5C11\u8282\u70B9\u7C7B\u578B");
  }
  const name = proxy.name || "\u672A\u547D\u540D\u8282\u70B9";
  proxy = { ...proxy };
  for (const field of MIHOMO_STRING_SCALAR_FIELDS) {
    if (proxy[field] === void 0 || proxy[field] === null) continue;
    const value = normalizeMihomoStringScalar(proxy[field]);
    if (value === void 0) throw new Error(`${field} \u5FC5\u987B\u662F\u5B57\u7B26\u4E32\u6216\u53EF\u65E0\u635F\u8868\u793A\u7684\u6574\u6570`);
    proxy[field] = value;
  }
  if (type2 === "direct" || type2 === "dns" || type2 === "reject") {
    return { ...proxy, name, type: type2 };
  }
  if (type2 === "wireguard" && Array.isArray(proxy.peers)) {
    proxy.peers = proxy.peers.map((peer) => peer && typeof peer === "object" && !Array.isArray(peer) ? { ...peer, port: parsePortNumber(peer.port) } : peer);
  }
  const server = proxy.server;
  const ports = normalizePortsSpecValue(proxy.ports);
  const isHysteria2 = type2 === "hysteria2" || type2 === "hy2";
  const isHysteria = type2 === "hysteria" || type2 === "hy";
  const supportsPortsOnly = isHysteria2;
  const shouldNormalizePorts = (isHysteria2 || isHysteria) && ports;
  const port = parsePortNumber(proxy.port) ?? (supportsPortsOnly && ports ? pickStablePortFromPorts(ports) : void 0);
  const baseNode = {
    ...proxy,
    name,
    type: type2,
    ...server !== void 0 ? { server } : {},
    ...proxy.port !== void 0 || port !== void 0 ? { port } : {},
    ...shouldNormalizePorts ? { ports } : {}
  };
  const endpointError = getNodeEndpointError(baseNode);
  if (endpointError) throw new Error(endpointError);
  applyWsEarlyDataInPlace(baseNode);
  switch (type2) {
    case "ss": {
      const normalizedSsPlugin = normalizeSsPlugin(proxy.plugin, proxy["plugin-opts"]);
      return {
        ...baseNode,
        type: "ss",
        cipher: proxy.cipher || "aes-256-gcm",
        password: proxy.password || "",
        udp: proxy.udp,
        plugin: normalizedSsPlugin.plugin,
        "plugin-opts": normalizedSsPlugin.pluginOpts
      };
    }
    case "ssr":
      return {
        ...baseNode,
        type: "ssr",
        cipher: proxy.cipher || "aes-256-cfb",
        password: proxy.password || "",
        protocol: proxy.protocol || "origin",
        "protocol-param": proxy["protocol-param"],
        obfs: proxy.obfs || "plain",
        "obfs-param": proxy["obfs-param"],
        udp: proxy.udp
      };
    case "vmess":
      return {
        ...baseNode,
        type: "vmess",
        uuid: proxy.uuid || "",
        alterId: Number(proxy.alterId) || 0,
        cipher: proxy.cipher || "auto",
        udp: proxy.udp,
        tls: proxy.tls,
        "skip-cert-verify": proxy["skip-cert-verify"],
        servername: proxy.servername,
        network: proxy.network,
        "http-opts": proxy["http-opts"],
        "ws-opts": proxy["ws-opts"],
        "h2-opts": proxy["h2-opts"],
        "grpc-opts": proxy["grpc-opts"]
      };
    case "vless": {
      const realityRaw = proxy["reality-opts"];
      const realityOpts = (() => {
        if (!realityRaw || typeof realityRaw !== "object") return void 0;
        const ro = realityRaw;
        const out = { ...ro };
        const publicKeyRaw = out["public-key"];
        if (typeof publicKeyRaw === "string") {
          out["public-key"] = publicKeyRaw.trim();
        }
        const shortIdStr = normalizeRealityShortId(out["short-id"]);
        if (shortIdStr) out["short-id"] = shortIdStr;
        else delete out["short-id"];
        return Object.keys(out).length > 0 ? out : void 0;
      })();
      return {
        ...baseNode,
        type: "vless",
        uuid: proxy.uuid || "",
        udp: proxy.udp,
        tls: proxy.tls,
        "skip-cert-verify": proxy["skip-cert-verify"],
        servername: proxy.servername,
        network: proxy.network,
        flow: proxy.flow,
        "http-opts": proxy["http-opts"],
        "h2-opts": proxy["h2-opts"],
        "ws-opts": proxy["ws-opts"],
        "grpc-opts": proxy["grpc-opts"],
        "xhttp-opts": proxy["xhttp-opts"],
        "reality-opts": realityOpts
      };
    }
    case "trojan":
      return {
        ...baseNode,
        type: "trojan",
        password: proxy.password || "",
        udp: proxy.udp,
        sni: proxy.sni,
        "skip-cert-verify": proxy["skip-cert-verify"],
        alpn: proxy.alpn,
        network: proxy.network,
        "ws-opts": proxy["ws-opts"],
        "grpc-opts": proxy["grpc-opts"]
      };
    case "anytls":
      return {
        ...baseNode,
        type: "anytls",
        password: proxy.password || "",
        udp: proxy.udp,
        sni: proxy.sni,
        alpn: proxy.alpn,
        "skip-cert-verify": proxy["skip-cert-verify"],
        "client-fingerprint": proxy["client-fingerprint"]
      };
    case "hysteria2":
    case "hy2":
      return {
        ...baseNode,
        type: "hysteria2",
        password: proxy.password || "",
        sni: proxy.sni,
        "skip-cert-verify": proxy["skip-cert-verify"],
        obfs: proxy.obfs,
        "obfs-password": proxy["obfs-password"],
        up: proxy.up,
        down: proxy.down,
        ports
      };
    case "hysteria":
    case "hy":
      return {
        ...baseNode,
        type: "hysteria",
        protocol: proxy.protocol || "udp",
        "auth-str": proxy["auth-str"],
        sni: proxy.sni,
        alpn: proxy.alpn,
        "skip-cert-verify": proxy["skip-cert-verify"],
        up: proxy.up,
        down: proxy.down,
        ports,
        obfs: proxy.obfs,
        _obfs: proxy._obfs,
        tfo: proxy.tfo
      };
    case "socks":
    case "socks5":
    case "socks4":
      return {
        ...baseNode,
        type: type2 === "socks" ? "socks5" : type2,
        username: proxy.username,
        password: proxy.password,
        udp: proxy.udp,
        tls: proxy.tls,
        "skip-cert-verify": proxy["skip-cert-verify"],
        sni: proxy.sni
      };
    case "http":
    case "https":
      return {
        ...baseNode,
        type: type2,
        username: proxy.username,
        password: proxy.password,
        tls: proxy.tls,
        "skip-cert-verify": proxy["skip-cert-verify"],
        sni: proxy.sni,
        headers: proxy.headers
      };
    case "tuic":
      return {
        ...baseNode,
        type: "tuic",
        uuid: proxy.uuid || "",
        password: proxy.password || "",
        sni: proxy.sni,
        alpn: proxy.alpn,
        "congestion-controller": proxy["congestion-controller"],
        "udp-relay-mode": proxy["udp-relay-mode"],
        "reduce-rtt": proxy["reduce-rtt"],
        "skip-cert-verify": proxy["skip-cert-verify"],
        "disable-sni": proxy["disable-sni"]
      };
    case "ssh":
      return {
        ...baseNode,
        type: "ssh",
        username: proxy.username,
        password: proxy.password,
        "private-key": proxy["private-key"],
        "private-key-passphrase": proxy["private-key-passphrase"],
        "host-key": proxy["host-key"]
      };
    case "mieru":
    case "masque":
    case "sudoku":
    case "wireguard":
    case "trusttunnel":
      return { ...baseNode, type: type2 };
    default:
      return { ...baseNode, type: type2 };
  }
}

// src/parser/config-line-tokenizer.ts
function parseBooleanish(value) {
  if (!value) return void 0;
  const normalized = value.trim().toLowerCase();
  if (["true", "1", "yes", "on"].includes(normalized)) return true;
  if (["false", "0", "no", "off"].includes(normalized)) return false;
  return void 0;
}
function stripQuotes(value) {
  const trimmed = value.trim();
  return trimmed.replace(/^['"]|['"]$/g, "");
}
function tokenizeConfigLine(line) {
  const eqIndex = line.indexOf("=");
  if (eqIndex <= 0) {
    throw new Error("\u65E0\u6548\u7684\u914D\u7F6E\u884C\u683C\u5F0F");
  }
  const name = stripQuotes(line.slice(0, eqIndex));
  const tokens = line.slice(eqIndex + 1).split(",").map((token) => token.trim()).filter(Boolean);
  if (tokens.length < 3) {
    throw new Error("\u914D\u7F6E\u884C\u7F3A\u5C11\u7C7B\u578B/\u5730\u5740/\u7AEF\u53E3");
  }
  const type2 = tokens[0].toLowerCase();
  const host = stripQuotes(tokens[1]);
  const portText = stripQuotes(tokens[2]);
  const port = Number(portText);
  if (!host || !/^\d+$/.test(portText) || !Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("\u914D\u7F6E\u884C\u4E2D\u7684\u5730\u5740\u6216\u7AEF\u53E3\u65E0\u6548");
  }
  const params = {};
  const extras = [];
  for (const token of tokens.slice(3)) {
    const splitIndex = token.indexOf("=");
    if (splitIndex === -1) {
      extras.push(stripQuotes(token));
      continue;
    }
    const key = token.slice(0, splitIndex).trim().toLowerCase();
    const value = stripQuotes(token.slice(splitIndex + 1));
    if (key) {
      params[key] = value;
      const dashed = key.replace(/_/g, "-");
      const underscored = key.replace(/-/g, "_");
      if (!(dashed in params)) params[dashed] = value;
      if (!(underscored in params)) params[underscored] = value;
    }
  }
  return { name, type: type2, host, port, params, extras };
}
function looksLikeConfigLine(line) {
  return /^[^#=\r\n][^=\r\n]*=\s*[a-zA-Z0-9_-]+\s*,/.test(line.trim());
}
function parseStringList(value) {
  if (!value) return void 0;
  const list = value.split(",").map((item) => item.trim()).filter(Boolean);
  return list.length > 0 ? list : void 0;
}
function parseWsHeaders(value) {
  if (!value) return void 0;
  const out = {};
  for (const pair of value.split("|")) {
    const idx = pair.indexOf(":");
    if (idx === -1) continue;
    const key = stripQuotes(pair.slice(0, idx)).trim();
    const val = stripQuotes(pair.slice(idx + 1)).trim();
    if (key && val) out[key] = val;
  }
  return Object.keys(out).length > 0 ? out : void 0;
}
function parseIntParam(value) {
  if (!value) return void 0;
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) ? parsed : void 0;
}
function isUuidLike(value) {
  const raw = (value ?? "").trim();
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(raw);
}
function inferSkipCertVerify(params) {
  const direct = parseBooleanish(params["skip-cert-verify"]);
  if (direct !== void 0) return direct;
  const allowInsecure = parseBooleanish(
    params["allow-insecure"] || params["allow_insecure"] || params.allowinsecure || params.insecure
  );
  if (allowInsecure !== void 0) return allowInsecure;
  const tlsVerification = parseBooleanish(params["tls-verification"]);
  return tlsVerification === false ? true : void 0;
}
function applyCommonNodeParams(node, params) {
  const sni = params.sni || params.peer || params["tls-name"] || params["server-name"] || void 0;
  if (sni) {
    if (node.type === "vmess" || node.type === "vless") {
      node.servername = sni;
    } else {
      node.sni = sni;
    }
  }
  const skipCertVerify = inferSkipCertVerify(params);
  if (skipCertVerify !== void 0) {
    node["skip-cert-verify"] = skipCertVerify;
  }
  const tlsFingerprint = params["tls-fingerprint"] || params["server-cert-fingerprint-sha256"] || params["server-fingerprint"] || params.fingerprint || params.fp;
  if (tlsFingerprint) {
    if (node.type === "hysteria2") {
      node.fingerprint = tlsFingerprint;
    } else {
      node["tls-fingerprint"] = tlsFingerprint;
    }
  }
  if (params["tls-cert-sha256"] || params["tls_cert_sha256"]) {
    node["tls-cert-sha256"] = params["tls-cert-sha256"] || params["tls_cert_sha256"];
  }
  if (params["tls-pubkey-sha256"] || params["tls_pubkey_sha256"]) {
    node["tls-pubkey-sha256"] = params["tls-pubkey-sha256"] || params["tls_pubkey_sha256"];
  }
  const disableSni = parseBooleanish(params["disable-sni"] || params["disable_sni"] || params.disablesni);
  if (disableSni !== void 0) {
    node["disable-sni"] = disableSni;
  }
  const blockQuic = parseBooleanish(params["block-quic"] || params.blockquic);
  if (blockQuic !== void 0) {
    node["block-quic"] = blockQuic;
  }
  const udpPort = parseIntParam(params["udp-port"] || params.udpport);
  if (udpPort !== void 0) {
    node["udp-port"] = udpPort;
  }
  const fastOpen = parseBooleanish(params["fast-open"] || params.tfo || params.fastopen);
  if (fastOpen !== void 0) {
    node.tfo = fastOpen;
  }
  const shadowTlsVersion = parseIntParam(params["shadow-tls-version"] || params["shadow_tls_version"]);
  if (shadowTlsVersion !== void 0) node["shadow-tls-version"] = shadowTlsVersion;
  if (params["shadow-tls-sni"]) node["shadow-tls-sni"] = params["shadow-tls-sni"];
  if (params["shadow-tls-password"]) node["shadow-tls-password"] = params["shadow-tls-password"];
}
function applyTransport(node, params, opts) {
  const rawTransport = params.transport || params.network || params.type || (parseBooleanish(params.ws) ? "ws" : void 0) || opts?.defaultTransport || "tcp";
  const transportRaw = rawTransport.trim().toLowerCase();
  const allowedTransports = opts?.allowedTransports ?? ["tcp", "ws", "httpupgrade", "grpc", "http", "h2"];
  if (!allowedTransports.includes(transportRaw)) {
    throw new Error(
      `\u4E0D\u652F\u6301\u7684 ${opts?.protocolName || "\u8282\u70B9"} \u4F20\u8F93\u5C42: transport=${transportRaw || "(empty)"}\uFF08\u4EC5\u652F\u6301 ${allowedTransports.join("/")})`
    );
  }
  const transport = transportRaw === "httpupgrade" ? "ws" : transportRaw;
  const wsHeaders = parseWsHeaders(params["ws-headers"]);
  const wsHost = params["ws-headers"] ? parseWsHeaders(params["ws-headers"])?.Host : void 0;
  const host = wsHost || params["transport-host"] || params["ws-host"] || params["obfs-host"] || params.host || void 0;
  const path = params["transport-path"] || params["ws-path"] || params["obfs-uri"] || params.wspath || params.path || "/";
  const serviceName = params["grpc-service-name"] || params["service-name"] || params["service_name"] || params.servicename || params.path || "";
  const grpcMode = params.mode || void 0;
  const grpcAuthority = params.authority || void 0;
  const xhttpHeaders = parseWsHeaders(params["xhttp-headers"] || params["xhttp_headers"] || params.headers);
  switch (transport) {
    case "ws":
      node.network = "ws";
      const { path: wsPath, earlyData } = splitWsPathEarlyData(path);
      node["ws-opts"] = {
        path: wsPath,
        headers: host || wsHeaders ? {
          ...wsHeaders || {},
          ...host ? { Host: host } : {}
        } : void 0,
        ...earlyData !== void 0 ? {
          "early-data-header-name": "Sec-WebSocket-Protocol",
          "max-early-data": earlyData
        } : {},
        ...transportRaw === "httpupgrade" ? { "v2ray-http-upgrade": true, "v2ray-http-upgrade-fast-open": true } : {}
      };
      break;
    case "grpc":
      node.network = "grpc";
      node["grpc-opts"] = {
        "grpc-service-name": serviceName.replace(/^\//, ""),
        ...grpcMode ? { _grpcType: grpcMode } : {},
        ...grpcAuthority ? { _grpcAuthority: grpcAuthority } : {}
      };
      break;
    case "http":
      node.network = "http";
      node["http-opts"] = {
        method: (params.method || "GET").trim().toUpperCase() || "GET",
        path: parseStringList(path) || ["/"],
        headers: host ? { Host: parseStringList(host) || [host] } : void 0
      };
      break;
    case "h2":
      node.network = "h2";
      node["h2-opts"] = {
        host: parseStringList(host),
        path
      };
      break;
    case "xhttp": {
      node.network = "xhttp";
      const reuseSettings = {};
      const reuseKeys = [
        "max-concurrency",
        "max-connections",
        "c-max-reuse-times",
        "h-max-request-times",
        "h-max-reusable-secs"
      ];
      for (const key of reuseKeys) {
        if (params[key]) reuseSettings[key] = params[key];
      }
      const downloadSettings = {};
      if (params["download-path"]) downloadSettings.path = params["download-path"];
      if (params["download-host"]) downloadSettings.host = params["download-host"];
      const downloadHeaders = parseWsHeaders(
        params["download-headers"] || params["download_headers"] || params.downloadheaders
      );
      if (downloadHeaders) downloadSettings.headers = downloadHeaders;
      const noGrpcHeader = parseBooleanish(params["no-grpc-header"] || params["no_grpc_header"] || params.nogrpcheader);
      const scMaxEachPostBytes = parseIntParam(params["sc-max-each-post-bytes"] || params["sc_max_each_post_bytes"]);
      node["xhttp-opts"] = {
        path,
        ...host ? { host } : {},
        ...params.mode ? { mode: params.mode } : {},
        ...xhttpHeaders ? { headers: xhttpHeaders } : {},
        ...noGrpcHeader !== void 0 ? { "no-grpc-header": noGrpcHeader } : {},
        ...params["x-padding-bytes"] ? { "x-padding-bytes": params["x-padding-bytes"] } : {},
        ...scMaxEachPostBytes !== void 0 ? { "sc-max-each-post-bytes": scMaxEachPostBytes } : {},
        ...Object.keys(reuseSettings).length > 0 ? { "reuse-settings": reuseSettings } : {},
        ...Object.keys(downloadSettings).length > 0 ? { "download-settings": downloadSettings } : {}
      };
      break;
    }
    default:
      node.network = "tcp";
  }
}

// src/parser/config-line-parser.ts
function buildSimpleProxyNode(type2, name, host, port, params) {
  if (type2 === "ssh") {
    const node2 = {
      name,
      type: "ssh",
      server: host,
      port,
      username: params.username,
      password: params.password
    };
    applyCommonNodeParams(node2, params);
    return node2;
  }
  if (type2 === "socks5" || type2 === "socks4") {
    const node2 = {
      name,
      type: type2,
      server: host,
      port,
      username: params.username,
      password: params.password,
      udp: type2 === "socks5",
      tls: parseBooleanish(params.tls) ?? parseBooleanish(params["over-tls"])
    };
    applyCommonNodeParams(node2, params);
    return node2;
  }
  const node = {
    name,
    type: type2,
    server: host,
    port,
    username: params.username,
    password: params.password,
    tls: type2 === "https" || parseBooleanish(params.tls) === true || parseBooleanish(params["over-tls"]) === true
  };
  if (params.headers) {
    node.headers = parseWsHeaders(params.headers);
  }
  applyCommonNodeParams(node, params);
  return node;
}
function buildSsNode(name, host, port, params) {
  const node = {
    name,
    type: "ss",
    server: host,
    port,
    cipher: params["encrypt-method"] || params.method || "aes-256-gcm",
    password: params.password || "",
    udp: parseBooleanish(params["udp-relay"])
  };
  const obfs = params.obfs;
  if (obfs === "http" || obfs === "tls") {
    node.plugin = "obfs";
    node["plugin-opts"] = {
      mode: obfs,
      ...params["obfs-host"] ? { host: params["obfs-host"] } : {},
      ...params["obfs-uri"] ? { path: params["obfs-uri"] } : {}
    };
  }
  applyCommonNodeParams(node, params);
  return node;
}
function buildTrojanNode(name, host, port, params) {
  const node = {
    name,
    type: "trojan",
    server: host,
    port,
    password: params.password || "",
    sni: params.sni || params.peer || params["tls-name"],
    "skip-cert-verify": inferSkipCertVerify(params)
  };
  if (params.fp || params.fingerprint) node["client-fingerprint"] = params.fp || params.fingerprint;
  if (params.alpn) node.alpn = parseStringList(params.alpn);
  applyTransport(node, params, {
    allowedTransports: ["tcp", "ws", "httpupgrade", "grpc"],
    protocolName: "trojan"
  });
  applyCommonNodeParams(node, params);
  return node;
}
function buildSnellNode(name, host, port, params) {
  const node = {
    name,
    type: "snell",
    server: host,
    port,
    psk: params.psk || params.password || ""
  };
  const version = Number.parseInt(params.version || "", 10);
  if (Number.isInteger(version)) node.version = version;
  const obfs = params.obfs;
  if (obfs === "http" || obfs === "tls") {
    node["obfs-opts"] = {
      mode: obfs,
      ...params["obfs-host"] ? { host: params["obfs-host"] } : {},
      ...params["obfs-uri"] ? { path: params["obfs-uri"] } : {}
    };
  }
  const udp = parseBooleanish(params["udp-relay"]);
  if (udp !== void 0) node.udp = udp;
  applyCommonNodeParams(node, params);
  return node;
}
function buildVmessNode(name, host, port, params, extras) {
  const uuid = params.username || params.uuid || params.id || extras.find(isUuidLike) || extras[1] || extras[0] || "";
  const cipher = extras.length >= 2 ? extras[0] : params.cipher || params.scy || params.encryption || "none";
  if (!uuid) throw new Error("vmess \u914D\u7F6E\u884C\u7F3A\u5C11 uuid");
  const node = {
    name,
    type: "vmess",
    server: host,
    port,
    uuid,
    alterId: parseIntParam(params.alterid || params["alter-id"] || params.aid) || 0,
    cipher,
    udp: parseBooleanish(params["udp-relay"]) ?? true,
    tls: parseBooleanish(params.tls) === true || parseBooleanish(params["over-tls"]) === true,
    servername: params.sni || params.peer || params["tls-name"],
    "skip-cert-verify": inferSkipCertVerify(params)
  };
  const fp = params["tls-fingerprint"] || params["server-cert-fingerprint-sha256"] || params.fp;
  if (fp) node["client-fingerprint"] = fp;
  applyTransport(node, params, {
    defaultTransport: parseBooleanish(params.ws) ? "ws" : void 0,
    allowedTransports: ["tcp", "ws", "httpupgrade", "grpc", "http", "h2"],
    protocolName: "vmess"
  });
  applyCommonNodeParams(node, params);
  return node;
}
function buildVlessNode(name, host, port, params, extras) {
  const uuid = params.username || params.uuid || extras[0] || "";
  if (!uuid) throw new Error("vless \u914D\u7F6E\u884C\u7F3A\u5C11 uuid");
  const node = {
    name,
    type: "vless",
    server: host,
    port,
    uuid,
    udp: parseBooleanish(params["udp-relay"]) ?? true,
    tls: parseBooleanish(params.tls) === true || parseBooleanish(params["over-tls"]) === true || Boolean(params.pbk || params["public-key"] || params.publickey || params["tls-name"] || params.sni),
    servername: params.sni || params.peer || params["tls-name"],
    "skip-cert-verify": inferSkipCertVerify(params)
  };
  if (params.flow) node.flow = params.flow;
  if (params.encryption) node.encryption = params.encryption;
  const packetEncoding = params["packet-encoding"] || params["packet_encoding"] || params.packetencoding;
  if (packetEncoding) node["packet-encoding"] = packetEncoding;
  const clientFingerprint = params.fp || params.fingerprint || params["client-fingerprint"] || params.clientfingerprint;
  if (clientFingerprint) node["client-fingerprint"] = clientFingerprint;
  const publicKey = params.pbk || params["public-key"] || params["public_key"] || params.publickey;
  const shortId = params.sid || params["short-id"] || params.shortid || params["short_id"];
  if (publicKey) {
    node["reality-opts"] = {
      "public-key": publicKey,
      ...shortId ? { "short-id": shortId } : {}
    };
    node["client-fingerprint"] = clientFingerprint || "chrome";
  }
  applyTransport(node, params, {
    defaultTransport: parseBooleanish(params.ws) ? "ws" : void 0,
    allowedTransports: ["tcp", "ws", "httpupgrade", "grpc", "http", "h2", "xhttp"],
    protocolName: "vless"
  });
  applyCommonNodeParams(node, params);
  return node;
}
function buildAnyTlsNode(name, host, port, params, extras) {
  const password = params.password || params.auth || extras[0] || "";
  if (!password) throw new Error("anytls \u914D\u7F6E\u884C\u7F3A\u5C11 password");
  const transport = (params.transport || params.network || params.type || "tcp").trim().toLowerCase();
  if (transport && transport !== "tcp" && transport !== "none") {
    throw new Error(`anytls \u914D\u7F6E\u884C\u4E0D\u652F\u6301 transport=${transport}\uFF08Mihomo \u4EC5\u652F\u6301\u7EAF TCP\uFF09`);
  }
  if (params["public-key"] || params["short-id"] || params.shortid || params.sid || params.pbk || params.spx) {
    throw new Error("anytls \u914D\u7F6E\u884C\u4E0D\u652F\u6301 Reality \u53C2\u6570\uFF08Mihomo \u4E0D\u652F\u6301\uFF09");
  }
  const node = {
    name,
    type: "anytls",
    server: host,
    port,
    password,
    udp: parseBooleanish(params["udp-relay"]) ?? true,
    sni: params.sni || params.peer || params["tls-name"],
    "skip-cert-verify": inferSkipCertVerify(params)
  };
  if (params.fp || params.fingerprint) node["client-fingerprint"] = params.fp || params.fingerprint;
  if (params.alpn) node.alpn = parseStringList(params.alpn);
  applyCommonNodeParams(node, params);
  return node;
}
function buildHysteria2Node(name, host, port, params, extras) {
  const password = params.password || params.auth || extras[0] || "";
  if (!password) throw new Error("hysteria2 \u914D\u7F6E\u884C\u7F3A\u5C11 password");
  const node = {
    name,
    type: "hysteria2",
    server: host,
    port,
    password,
    sni: params.sni || params.peer || params["tls-name"],
    "skip-cert-verify": inferSkipCertVerify(params)
  };
  if (params["download-bandwidth"]) node.down = params["download-bandwidth"];
  if (params["salamander-password"]) {
    node.obfs = "salamander";
    node["obfs-password"] = params["salamander-password"];
  }
  if (params["tls-fingerprint"] || params["server-cert-fingerprint-sha256"]) {
    node.fingerprint = params["tls-fingerprint"] || params["server-cert-fingerprint-sha256"];
  }
  const portHop = parseIntParam(params["port-hopping-interval"] || params["port_hopping_interval"]);
  if (portHop !== void 0) node["hop-interval"] = portHop;
  applyCommonNodeParams(node, params);
  return node;
}
function buildHysteriaNode(name, host, port, params, extras) {
  const auth = params["auth-str"] || params.auth || params.password || extras[0] || "";
  const node = {
    name,
    type: "hysteria",
    server: host,
    port,
    protocol: params.protocol || "udp",
    ...auth ? { "auth-str": auth } : {}
  };
  if (params.sni || params.peer || params["tls-name"]) node.sni = params.sni || params.peer || params["tls-name"];
  if (inferSkipCertVerify(params) !== void 0) node["skip-cert-verify"] = inferSkipCertVerify(params);
  if (params.alpn) node.alpn = parseStringList(params.alpn);
  if (params.up || params.upmbps) node.up = params.up || params.upmbps;
  if (params.down || params.downmbps) node.down = params.down || params.downmbps;
  if (params.mport || params.ports) node.ports = params.mport || params.ports;
  if (params["obfs-param"] || params.obfsparam) node.obfs = params["obfs-param"] || params.obfsparam;
  if (params.obfs !== void 0) node["_obfs"] = params.obfs;
  applyCommonNodeParams(node, params);
  return node;
}
function buildTuicNode(name, host, port, params, extras, versionOverride) {
  const token = params.token || extras[0] || void 0;
  const uuid = params.uuid || params.username || void 0;
  const password = params.password || void 0;
  if (!token && (!uuid || !password)) {
    throw new Error("tuic \u914D\u7F6E\u884C\u7F3A\u5C11 token \u6216 uuid/password");
  }
  const node = {
    name,
    type: "tuic",
    server: host,
    port,
    ...token ? { token } : { uuid, password },
    ...versionOverride ? { version: versionOverride } : {}
  };
  if (params.sni || params.peer || params["tls-name"]) node.sni = params.sni || params.peer || params["tls-name"];
  if (params.alpn) node.alpn = parseStringList(params.alpn);
  if (params["congestion-controller"] || params.congestioncontrol) {
    node["congestion-controller"] = params["congestion-controller"] || params.congestioncontrol;
  }
  if (params["udp-relay-mode"] || params.udprelaymode) {
    node["udp-relay-mode"] = params["udp-relay-mode"] || params.udprelaymode;
  }
  if (inferSkipCertVerify(params)) node["skip-cert-verify"] = true;
  if (parseBooleanish(params["disable-sni"])) node["disable-sni"] = true;
  applyCommonNodeParams(node, params);
  return node;
}
function buildWireguardNode(name, host, port, params) {
  const privateKey = params["private-key"] || params.privatekey || "";
  if (!privateKey) throw new Error("wireguard \u914D\u7F6E\u884C\u7F3A\u5C11 private-key");
  const node = {
    name,
    type: "wireguard",
    server: host,
    port,
    "private-key": privateKey,
    udp: parseBooleanish(params.udp) ?? true
  };
  if (params["public-key"] || params.publickey) node["public-key"] = params["public-key"] || params.publickey;
  if (params["pre-shared-key"] || params.presharedkey) node["pre-shared-key"] = params["pre-shared-key"] || params.presharedkey;
  if (params.ip || params["interface-ip"]) node.ip = params.ip || params["interface-ip"];
  if (params.ipv6 || params["interface-ipv6"]) node.ipv6 = params.ipv6 || params["interface-ipv6"];
  if (params["section-name"]) node["section-name"] = params["section-name"];
  const mtu = parseIntParam(params.mtu);
  if (mtu !== void 0) node.mtu = mtu;
  applyCommonNodeParams(node, params);
  return node;
}
function parseConfigLineRaw(line) {
  const { name, type: type2, host, port, params, extras } = tokenizeConfigLine(line);
  if (type2 === "socks" || type2 === "socks5" || type2 === "socks4" || type2 === "socks5+tls" || type2 === "socks5-tls") {
    const normalizedType = type2 === "socks" ? "socks5" : type2 === "socks5+tls" || type2 === "socks5-tls" ? "socks5" : type2;
    const nextParams = type2 === "socks5+tls" || type2 === "socks5-tls" ? { ...params, tls: params.tls || params["over-tls"] || "true" } : params;
    return buildSimpleProxyNode(normalizedType, name, host, port, nextParams);
  }
  if (type2 === "http" || type2 === "https") {
    return buildSimpleProxyNode(type2, name, host, port, params);
  }
  if (type2 === "ssh") {
    return buildSimpleProxyNode("ssh", name, host, port, params);
  }
  if (type2 === "ss") {
    return buildSsNode(name, host, port, params);
  }
  if (type2 === "trojan") {
    return buildTrojanNode(name, host, port, params);
  }
  if (type2 === "vmess") {
    return buildVmessNode(name, host, port, params, extras);
  }
  if (type2 === "vless") {
    return buildVlessNode(name, host, port, params, extras);
  }
  if (type2 === "anytls") {
    return buildAnyTlsNode(name, host, port, params, extras);
  }
  if (type2 === "hysteria2") {
    return buildHysteria2Node(name, host, port, params, extras);
  }
  if (type2 === "hysteria" || type2 === "hy") {
    return buildHysteriaNode(name, host, port, params, extras);
  }
  if (type2 === "tuic" || type2 === "tuic-v5") {
    return buildTuicNode(name, host, port, params, extras, type2 === "tuic-v5" ? 5 : void 0);
  }
  if (type2 === "wireguard") {
    return buildWireguardNode(name, host, port, params);
  }
  if (type2 === "snell") {
    return buildSnellNode(name, host, port, params);
  }
  throw new Error(`\u4E0D\u652F\u6301\u7684\u914D\u7F6E\u884C\u534F\u8BAE: ${type2}`);
}
function parseConfigLine(line) {
  const node = parseConfigLineRaw(line);
  return node ? canonicalizeParsedNode(node) : null;
}

// src/parser/platform/peggy/surge.js
var peggy = __toESM(require_peg(), 1);
var grammars = String.raw`
// global initializer
{{
    function $set(obj, path, value) {
      if (Object(obj) !== obj) return obj;
      if (!Array.isArray(path)) path = path.toString().match(/[^.[\]]+/g) || [];
      path
        .slice(0, -1)
        .reduce((a, c, i) => (Object(a[c]) === a[c] ? a[c] : (a[c] = Math.abs(path[i + 1]) >> 0 === +path[i + 1] ? [] : {})), obj)[
        path[path.length - 1]
      ] = value;
      return obj;
    }
}}

// per-parser initializer
{
    const proxy = {};
    const obfs = {};
    const $ = {};

    function handleWebsocket() {
        if (obfs.type === "ws") {
            proxy.network = "ws";
            $set(proxy, "ws-opts.path", obfs.path);
            $set(proxy, "ws-opts.headers", obfs['ws-headers']);
            if (proxy['ws-opts'] && proxy['ws-opts']['headers'] && proxy['ws-opts']['headers'].Host) {
                proxy['ws-opts']['headers'].Host = proxy['ws-opts']['headers'].Host.replace(/^"(.*)"$/, '$1')
            }
        }
    }
    function handleShadowTLS() {
        if (proxy['shadow-tls-password'] && !proxy['shadow-tls-version']) {
            proxy['shadow-tls-version'] = 2;
        }
    }
}

start = (anytls/shadowsocks/vmess/trojan/https/http/snell/socks5/socks5_tls/tuic/tuic_v5/wireguard/hysteria2/ssh/trust_tunnel/direct) {
    return proxy;
}

shadowsocks = tag equals "ss" address (method/passwordk/obfs/obfs_host/obfs_uri/ip_version/underlying_proxy/tos/allow_other_interface/interface/test_url/test_udp/test_timeout/hybrid/no_error_alert/fast_open/tfo/udp_relay/shadow_tls_version/shadow_tls_sni/shadow_tls_password/block_quic/udp_port/others)* {
    proxy.type = "ss";
    // handle obfs
    if (obfs.type == "http" || obfs.type === "tls") {
        proxy.plugin = "obfs";
        $set(proxy, "plugin-opts.mode", obfs.type);
        $set(proxy, "plugin-opts.host", obfs.host);
        $set(proxy, "plugin-opts.path", obfs.path);
    }
    handleShadowTLS();
}
vmess = tag equals "vmess" address (vmess_uuid/vmess_aead/ws/ws_path/ws_headers/method/ip_version/underlying_proxy/tos/allow_other_interface/interface/test_url/test_udp/test_timeout/hybrid/no_error_alert/tls/sni/tls_fingerprint/tls_verification/fast_open/tfo/udp_relay/shadow_tls_version/shadow_tls_sni/shadow_tls_password/block_quic/others)* {
    proxy.type = "vmess";
    proxy.cipher = proxy.cipher || "none";
    // Surfboard 与 Surge 默认不一致, 不管 Surfboard https://getsurfboard.com/docs/profile-format/proxy/external-proxy/vmess
    if (proxy.aead) {
        proxy.alterId = 0;
    } else {
        proxy.alterId = 1;
    }
    handleWebsocket();
    handleShadowTLS();
}
trojan = tag equals "trojan" address (passwordk/ws/ws_path/ws_headers/tls/sni/tls_fingerprint/tls_verification/ip_version/underlying_proxy/tos/allow_other_interface/interface/test_url/test_udp/test_timeout/hybrid/no_error_alert/fast_open/tfo/udp_relay/shadow_tls_version/shadow_tls_sni/shadow_tls_password/block_quic/others)* {
    proxy.type = "trojan";
    handleWebsocket();
    handleShadowTLS();
}
https = tag equals "https" address (username password)? (usernamek passwordk)? (sni/tls_fingerprint/tls_verification/ip_version/underlying_proxy/tos/allow_other_interface/interface/test_url/test_udp/test_timeout/hybrid/no_error_alert/fast_open/tfo/shadow_tls_version/shadow_tls_sni/shadow_tls_password/block_quic/others)* {
    proxy.type = "http";
    proxy.tls = true;
    handleShadowTLS();
}
http = tag equals "http" address (username password)? (usernamek passwordk)? (ip_version/underlying_proxy/tos/allow_other_interface/interface/test_url/test_udp/test_timeout/hybrid/no_error_alert/fast_open/tfo/shadow_tls_version/shadow_tls_sni/shadow_tls_password/block_quic/others)* {
    proxy.type = "http";
    handleShadowTLS();
}
ssh = tag equals "ssh" address (username password)? (usernamek passwordk)? (server_fingerprint/idle_timeout/private_key/ip_version/underlying_proxy/tos/allow_other_interface/interface/test_url/test_udp/test_timeout/hybrid/no_error_alert/fast_open/tfo/shadow_tls_version/shadow_tls_sni/shadow_tls_password/block_quic/others)* {
    proxy.type = "ssh";
    handleShadowTLS();
}
snell = tag equals "snell" address (snell_version/snell_psk/obfs/obfs_host/obfs_uri/ip_version/underlying_proxy/tos/allow_other_interface/interface/test_url/test_udp/test_timeout/hybrid/no_error_alert/fast_open/tfo/udp_relay/reuse/shadow_tls_version/shadow_tls_sni/shadow_tls_password/block_quic/others)* {
    proxy.type = "snell";
    // handle obfs
    if (obfs.type == "http" || obfs.type === "tls") {
        $set(proxy, "obfs-opts.mode", obfs.type);
        $set(proxy, "obfs-opts.host", obfs.host);
        $set(proxy, "obfs-opts.path", obfs.path);
    }
    handleShadowTLS();
}
tuic = tag equals "tuic" address (alpn/token/ip_version/underlying_proxy/tos/allow_other_interface/interface/test_url/test_udp/test_timeout/hybrid/no_error_alert/tls_fingerprint/tls_verification/sni/fast_open/tfo/ecn/shadow_tls_version/shadow_tls_sni/shadow_tls_password/block_quic/port_hopping_interval/others)* {
    proxy.type = "tuic";
    handleShadowTLS();
}
tuic_v5 = tag equals "tuic-v5" address (alpn/passwordk/uuidk/ip_version/underlying_proxy/tos/allow_other_interface/interface/test_url/test_udp/test_timeout/hybrid/no_error_alert/tls_fingerprint/tls_verification/sni/fast_open/tfo/ecn/shadow_tls_version/shadow_tls_sni/shadow_tls_password/block_quic/port_hopping_interval/others)* {
    proxy.type = "tuic";
    proxy.version = 5;
    handleShadowTLS();
}
wireguard = tag equals "wireguard" (section_name/no_error_alert/ip_version/underlying_proxy/tos/allow_other_interface/interface/test_url/test_udp/test_timeout/hybrid/shadow_tls_version/shadow_tls_sni/shadow_tls_password/block_quic/others)* {
    proxy.type = "wireguard-surge";
    handleShadowTLS();
}
hysteria2 = tag equals "hysteria2" address (no_error_alert/ip_version/underlying_proxy/tos/allow_other_interface/interface/test_url/test_udp/test_timeout/hybrid/sni/tls_verification/passwordk/tls_fingerprint/download_bandwidth/ecn/shadow_tls_version/shadow_tls_sni/shadow_tls_password/block_quic/port_hopping_interval/salamander_password/others)* {
    proxy.type = "hysteria2";
    handleShadowTLS();
}
socks5 = tag equals "socks5" address (username password)? (usernamek passwordk)? (udp_relay/no_error_alert/ip_version/underlying_proxy/tos/allow_other_interface/interface/test_url/test_udp/test_timeout/hybrid/fast_open/tfo/shadow_tls_version/shadow_tls_sni/shadow_tls_password/block_quic/others)* {
    proxy.type = "socks5";
    handleShadowTLS();
}
socks5_tls = tag equals "socks5-tls" address (username password)? (usernamek passwordk)? (udp_relay/no_error_alert/ip_version/underlying_proxy/tos/allow_other_interface/interface/test_url/test_udp/test_timeout/hybrid/sni/tls_fingerprint/tls_verification/fast_open/tfo/shadow_tls_version/shadow_tls_sni/shadow_tls_password/block_quic/others)* {
    proxy.type = "socks5";
    proxy.tls = true;
    handleShadowTLS();
}
anytls = tag equals "anytls" address (passwordk/reuse/ip_version/underlying_proxy/tos/allow_other_interface/interface/test_url/test_udp/test_timeout/hybrid/no_error_alert/tls_fingerprint/tls_verification/sni/fast_open/tfo/block_quic/others)* {
    proxy.type = "anytls";
    proxy.tls = true;
}
trust_tunnel = tag equals "trust-tunnel" address (usernamek/passwordk/reuse/ip_version/underlying_proxy/tos/allow_other_interface/interface/test_url/test_udp/test_timeout/hybrid/no_error_alert/tls_fingerprint/tls_verification/sni/fast_open/tfo/block_quic/others)* {
    proxy.type = "trusttunnel";
    proxy.tls = true;
}

direct = tag equals "direct" (udp_relay/ip_version/underlying_proxy/tos/allow_other_interface/interface/test_url/test_udp/test_timeout/hybrid/no_error_alert/fast_open/tfo/block_quic/others)* {
    proxy.type = "direct";
}
address = comma server:server comma port:port {
    proxy.server = server;
    proxy.port = port;
}

server = ip/domain

ip = & {
    const start = peg$currPos;
    let j = start;
    while (j < input.length) {
        if (input[j] === ",") break;
        j++;
    }
    peg$currPos = j;
    $.ip = input.substring(start, j).trim();
    return true;
} { return $.ip; }

domain = match:[0-9a-zA-z-_.]+ { 
    const domain = match.join(""); 
    if (/(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]/.test(domain)) {
        return domain;
    }
}

port = digits:[0-9]+ { 
    const port = parseInt(digits.join(""), 10); 
    if (port >= 0 && port <= 65535) {
    	return port;
    }
}

port_hopping_interval = comma "port-hopping-interval" equals match:$[0-9]+ { proxy["hop-interval"] = parseInt(match.trim()); }

username = & {
    let j = peg$currPos; 
    let start, end;
    let first = true;
    while (j < input.length) {
        if (input[j] === ',') {
            if (first) {
                start = j + 1;
                first = false;
            } else {
                end = j;
                break;
            }
        }
        j++;
    }
    const match = input.substring(start, end);
    if (match.indexOf("=") === -1) {
        $.username = match;
        peg$currPos = end;
        return true;
    }
} { proxy.username = $.username.trim().replace(/^"(.*?)"$/, '$1').replace(/^'(.*?)'$/, '$1'); }
password = comma match:[^,]+ { proxy.password = match.join("").replace(/^"(.*)"$/, '$1').replace(/^'(.*?)'$/, '$1'); }

tls = comma "tls" equals flag:bool { proxy.tls = flag; }
sni = comma "sni" equals sni:("off"/server) {
    if (sni === "off") {
        proxy["disable-sni"] = true;
    } else {
        proxy.sni = sni;
    }
}
tls_verification = comma "skip-cert-verify" equals flag:bool { proxy["skip-cert-verify"] = flag; }
tls_fingerprint = comma "server-cert-fingerprint-sha256" equals tls_fingerprint:$[^,]+ { proxy["tls-fingerprint"] = tls_fingerprint.trim(); }

snell_psk = comma "psk" equals match:[^,]+ { proxy.psk = match.join(""); }
snell_version = comma "version" equals match:$[0-9]+ { proxy.version = parseInt(match.trim()); }

usernamek = comma "username" equals match:[^,]+ { proxy.username = match.join("").replace(/^"(.*?)"$/, '$1').replace(/^'(.*?)'$/, '$1'); }
passwordk = comma "password" equals match:[^,]+ { proxy.password = match.join("").replace(/^"(.*?)"$/, '$1').replace(/^'(.*?)'$/, '$1'); }
vmess_uuid = comma "username" equals match:[^,]+ { proxy.uuid = match.join(""); }
vmess_aead = comma "vmess-aead" equals flag:bool { proxy.aead = flag; }

method = comma "encrypt-method" equals cipher:cipher {
    proxy.cipher = cipher;
}
cipher = ("aes-128-cfb"/"aes-128-ctr"/"aes-128-gcm"/"aes-192-cfb"/"aes-192-ctr"/"aes-192-gcm"/"aes-256-cfb"/"aes-256-ctr"/"aes-256-gcm"/"bf-cfb"/"camellia-128-cfb"/"camellia-192-cfb"/"camellia-256-cfb"/"cast5-cfb"/"chacha20-ietf-poly1305"/"chacha20-ietf"/"chacha20-poly1305"/"chacha20"/"des-cfb"/"idea-cfb"/"none"/"rc2-cfb"/"rc4-md5"/"rc4"/"salsa20"/"seed-cfb"/"xchacha20-ietf-poly1305"/"2022-blake3-aes-128-gcm"/"2022-blake3-aes-256-gcm");

ws = comma "ws" equals flag:bool { if (flag) obfs.type = "ws"; }
ws_headers = comma "ws-headers" equals headers:$[^,]+ {
    const pairs = headers.split("|");
    const result = {};
    pairs.forEach(pair => {
        const [key, value] = pair.trim().split(":");
        result[key.trim()] = value.trim().replace(/^"(.*?)"$/, '$1').replace(/^'(.*?)'$/, '$1');
    })
    obfs["ws-headers"] = result;
}
ws_path = comma "ws-path" equals path:uri { obfs.path = path.trim().replace(/^"(.*?)"$/, '$1').replace(/^'(.*?)'$/, '$1'); }

obfs = comma "obfs" equals type:("http"/"tls") { obfs.type = type; }
obfs_host = comma "obfs-host" equals host:domain { obfs.host = host; };
obfs_uri = comma "obfs-uri" equals path:uri { obfs.path = path }
uri = $[^,]+

udp_relay = comma "udp-relay" equals flag:bool { proxy.udp = flag; }
fast_open = comma "fast-open" equals flag:bool { proxy.tfo = flag; }
reuse = comma "reuse" equals flag:bool { proxy.reuse = flag; }
ecn = comma "ecn" equals flag:bool { proxy.ecn = flag; }
tfo = comma "tfo" equals flag:bool { proxy.tfo = flag; }
ip_version = comma "ip-version" equals match:[^,]+ { proxy["ip-version"] = match.join(""); }
section_name = comma "section-name" equals match:[^,]+ { proxy["section-name"] = match.join(""); }
no_error_alert = comma "no-error-alert" equals match:[^,]+ { proxy["no-error-alert"] = match.join(""); }
underlying_proxy = comma "underlying-proxy" equals match:[^,]+ { proxy["underlying-proxy"] = match.join(""); }
download_bandwidth = comma "download-bandwidth" equals match:[^,]+ { proxy.down = match.join(""); }
test_url = comma "test-url" equals match:[^,]+ { proxy["test-url"] = match.join(""); }
test_udp = comma "test-udp" equals match:[^,]+ { proxy["test-udp"] = match.join(""); }
test_timeout = comma "test-timeout" equals match:$[0-9]+ { proxy["test-timeout"] = parseInt(match.trim()); }
tos = comma "tos" equals match:$[0-9]+ { proxy.tos = parseInt(match.trim()); }
interface = comma "interface" equals match:[^,]+ { proxy.interface = match.join(""); }
allow_other_interface = comma "allow-other-interface" equals flag:bool { proxy["allow-other-interface"] = flag; }
hybrid = comma "hybrid" equals flag:bool { proxy.hybrid = flag; }
idle_timeout = comma "idle-timeout" equals match:$[0-9]+ { proxy["idle-timeout"] = parseInt(match.trim()); }
private_key = comma "private-key" equals match:[^,]+ { proxy["keystore-private-key"] = match.join("").replace(/^"(.*)"$/, '$1'); }
server_fingerprint = comma "server-fingerprint" equals match:[^,]+ { proxy["server-fingerprint"] = match.join("").replace(/^"(.*)"$/, '$1'); }
block_quic = comma "block-quic" equals match:[^,]+ { proxy["block-quic"] = match.join(""); }
udp_port = comma "udp-port" equals match:$[0-9]+ { proxy["udp-port"] = parseInt(match.trim()); }
shadow_tls_version = comma "shadow-tls-version" equals match:$[0-9]+ { proxy["shadow-tls-version"] = parseInt(match.trim()); }
shadow_tls_sni = comma "shadow-tls-sni" equals match:[^,]+ { proxy["shadow-tls-sni"] = match.join(""); }
shadow_tls_password = comma "shadow-tls-password" equals match:[^,]+ { proxy["shadow-tls-password"] = match.join("").replace(/^"(.*?)"$/, '$1').replace(/^'(.*?)'$/, '$1'); }
token = comma "token" equals match:[^,]+ { proxy.token = match.join(""); }
alpn = comma "alpn" equals match:[^,]+ { proxy.alpn = match.join(""); }
uuidk = comma "uuid" equals match:[^,]+ { proxy.uuid = match.join(""); }
salamander_password = comma "salamander-password" equals match:[^,]+ { proxy['obfs-password'] = match.join("").replace(/^"(.*?)"$/, '$1').replace(/^'(.*?)'$/, '$1'); proxy.obfs = 'salamander'; }

tag = match:[^=,]* { proxy.name = match.join("").trim(); }
comma = _ "," _
equals = _ "=" _
_ = [ \r\t]*
bool = b:("true"/"false") { return b === "true" }
others = comma [^=,]+ equals [^=,]+
`;
var parser;
function getParser() {
  if (!parser) {
    parser = peggy.generate(grammars);
  }
  return parser;
}

// src/parser/platform/peggy/loon.js
var peggy2 = __toESM(require_peg(), 1);
var grammars2 = String.raw`
// global initializer
{{
    function $set(obj, path, value) {
      if (Object(obj) !== obj) return obj;
      if (!Array.isArray(path)) path = path.toString().match(/[^.[\]]+/g) || [];
      path
        .slice(0, -1)
        .reduce((a, c, i) => (Object(a[c]) === a[c] ? a[c] : (a[c] = Math.abs(path[i + 1]) >> 0 === +path[i + 1] ? [] : {})), obj)[
        path[path.length - 1]
      ] = value;
      return obj;
    }
}}

// per-parser initializer
{
    const proxy = {};
    const obfs = {};
    const transport = {};
    const $ = {};

    function handleTransport() {
        if (transport.type === "tcp") { /* do nothing */ }
        else if (transport.type === "ws") {
            proxy.network = "ws";
            $set(proxy, "ws-opts.path", transport.path);
            $set(proxy, "ws-opts.headers.Host", transport.host);
        } else if (transport.type === "http") {
            proxy.network = "http";
            $set(proxy, "http-opts.path", transport.path);
            $set(proxy, "http-opts.headers.Host", transport.host);
        }
    }
}

start = (shadowsocksr/shadowsocks/vmess/vless/trojan/https/http/socks5/hysteria2/anytls) {
    return proxy;
}

shadowsocksr = tag equals "shadowsocksr"i address method password (ssr_protocol/ssr_protocol_param/obfs_ssr/obfs_ssr_param/obfs_host/obfs_uri/fast_open/udp_relay/udp_port/shadow_tls_version/shadow_tls_sni/shadow_tls_password/ip_mode/block_quic/others)*{
    proxy.type = "ssr";
    // handle ssr obfs
    proxy.obfs = obfs.type;
}
shadowsocks = tag equals "shadowsocks"i address method password (obfs_typev obfs_hostv)? (obfs_ss/obfs_host/obfs_uri/fast_open/udp_relay/udp_port/shadow_tls_version/shadow_tls_sni/shadow_tls_password/ip_mode/block_quic/others)* {
    proxy.type = "ss";
    // handle ss obfs
    if (obfs.type == "http" || obfs.type === "tls") {
        proxy.plugin = "obfs";
        $set(proxy, "plugin-opts.mode", obfs.type);
        $set(proxy, "plugin-opts.host", obfs.host);
        $set(proxy, "plugin-opts.path", obfs.path);
    }
}
vmess = tag equals "vmess"i address method uuid (transport/transport_host/transport_path/over_tls/tls_name/sni/tls_verification/tls_cert_sha256/tls_pubkey_sha256/vmess_alterId/fast_open/udp_relay/ip_mode/public_key/short_id/block_quic/others)* {
    proxy.type = "vmess";
    proxy.cipher = proxy.cipher || "none";
    proxy.alterId = proxy.alterId || 0;
    handleTransport();
}
vless = tag equals "vless"i address uuid (transport/transport_host/transport_path/over_tls/tls_name/sni/tls_verification/tls_cert_sha256/tls_pubkey_sha256/fast_open/udp_relay/ip_mode/flow/public_key/short_id/block_quic/others)* {
    proxy.type = "vless";
    handleTransport();
}
trojan = tag equals "trojan"i address password (transport/transport_host/transport_path/over_tls/tls_name/sni/tls_verification/tls_cert_sha256/tls_pubkey_sha256/fast_open/udp_relay/ip_mode/block_quic/others)* {
    proxy.type = "trojan";
    handleTransport();
}
anytls = tag equals "anytls"i address password (transport/transport_host/transport_path/over_tls/tls_name/sni/tls_verification/tls_cert_sha256/tls_pubkey_sha256/fast_open/udp_relay/ip_mode/block_quic/idle_session_check_interval/idle_session_timeout/min_idle_session/max_stream_count/others)* {
    proxy.type = "anytls";
    handleTransport();
}
hysteria2 = tag equals "hysteria2"i address password (tls_name/sni/tls_verification/tls_cert_sha256/tls_pubkey_sha256/udp_relay/fast_open/download_bandwidth/salamander_password/ecn/ip_mode/block_quic/others)* {
    proxy.type = "hysteria2";
}
https = tag equals "https"i address (username password)? (tls_name/sni/tls_verification/tls_cert_sha256/tls_pubkey_sha256/fast_open/udp_relay/ip_mode/block_quic/others)* {
    proxy.type = "http";
    proxy.tls = true;
}
http = tag equals "http"i address (username password)? (fast_open/udp_relay/ip_mode/block_quic/others)* {
    proxy.type = "http";
}
socks5 = tag equals "socks5"i address (username password)? (over_tls/tls_name/sni/tls_verification/tls_cert_sha256/tls_pubkey_sha256/fast_open/udp_relay/ip_mode/block_quic/others)* {
    proxy.type = "socks5";
}

address = comma server:server comma port:port {
    proxy.server = server;
    proxy.port = port;
}

server = ip/domain

ip = & {
    const start = peg$currPos;
    let j = start;
    while (j < input.length) {
        if (input[j] === ",") break;
        j++;
    }
    peg$currPos = j;
    $.ip = input.substring(start, j).trim();
    return true;
} { return $.ip; }

domain = match:[0-9a-zA-z-_.]+ { 
    const domain = match.join(""); 
    if (/(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]/.test(domain)) {
        return domain;
    }
    throw new Error("Invalid domain: " + domain);
}

port = digits:[0-9]+ { 
    const port = parseInt(digits.join(""), 10); 
    if (port >= 0 && port <= 65535) {
    	return port;
    }
    throw new Error("Invalid port number: " + port);
}

method = comma cipher:cipher { 
    proxy.cipher = cipher;
}
cipher = ("aes-128-cfb"/"aes-128-ctr"/"aes-128-gcm"/"aes-192-cfb"/"aes-192-ctr"/"aes-192-gcm"/"aes-256-cfb"/"aes-256-ctr"/"aes-256-gcm"/"auto"/"bf-cfb"/"camellia-128-cfb"/"camellia-192-cfb"/"camellia-256-cfb"/"chacha20-ietf-poly1305"/"chacha20-ietf"/"chacha20-poly1305"/"chacha20"/"none"/"rc4-md5"/"rc4"/"salsa20"/"xchacha20-ietf-poly1305"/"2022-blake3-aes-128-gcm"/"2022-blake3-aes-256-gcm");

username = & {
    let j = peg$currPos; 
    let start, end;
    let first = true;
    while (j < input.length) {
        if (input[j] === ',') {
            if (first) {
                start = j + 1;
                first = false;
            } else {
                end = j;
                break;
            }
        }
        j++;
    }
    const match = input.substring(start, end);
    if (match.indexOf("=") === -1) {
        $.username = match;
        peg$currPos = end;
        return true;
    }
} { proxy.username = $.username; }
password = comma '"' match:[^"]* '"' { proxy.password = match.join(""); }
uuid = comma '"' match:[^"]+ '"' { proxy.uuid = match.join(""); }

obfs_typev = comma type:("http"/"tls") { obfs.type = type; }
obfs_hostv = comma match:[^,]+ { obfs.host = match.join(""); }

obfs_ss = comma "obfs-name" equals type:("http"/"tls") { obfs.type = type; }

obfs_ssr = comma "obfs" equals type:("plain"/"http_simple"/"http_post"/"random_head"/"tls1.2_ticket_auth"/"tls1.2_ticket_fastauth") { obfs.type = type; }
obfs_ssr_param = comma "obfs-param" equals match:$[^,]+ { proxy["obfs-param"] = match; }

obfs_host = comma "obfs-host" equals host:domain { obfs.host = host; }
obfs_uri = comma "obfs-uri" equals uri:uri { obfs.path = uri; }
uri = $[^,]+

transport = comma "transport" equals type:("tcp"/"ws"/"http") { transport.type = type; }
transport_host = comma "host" equals host:domain { transport.host = host; }
transport_path = comma "path" equals path:uri { transport.path = path; }

ssr_protocol = comma "protocol" equals protocol:("origin"/"auth_sha1_v4"/"auth_aes128_md5"/"auth_aes128_sha1"/"auth_chain_a"/"auth_chain_b") { proxy.protocol = protocol; }
ssr_protocol_param = comma "protocol-param" equals param:$[^=,]+ { proxy["protocol-param"] = param; }

vmess_alterId = comma "alterId" equals alterId:$[0-9]+ { proxy.alterId = parseInt(alterId); } 

udp_port = comma "udp-port" equals match:$[0-9]+ { proxy["udp-port"] = parseInt(match.trim()); }
shadow_tls_version = comma "shadow-tls-version" equals match:$[0-9]+ { proxy["shadow-tls-version"] = parseInt(match.trim()); }
shadow_tls_sni = comma "shadow-tls-sni" equals match:[^,]+ { proxy["shadow-tls-sni"] = match.join(""); }
shadow_tls_password = comma "shadow-tls-password" equals match:[^,]+ { proxy["shadow-tls-password"] = match.join(""); }

over_tls = comma "over-tls" equals flag:bool { proxy.tls = flag; }
tls_name = comma sni:("tls-name") equals host:domain { proxy.sni = host; }
sni = comma sni:("sni") equals host:domain { proxy.sni = host; }
tls_verification = comma "skip-cert-verify" equals flag:bool { proxy["skip-cert-verify"] = flag; }
tls_cert_sha256 = comma "tls-cert-sha256" equals match:[^,]+ { proxy["tls-fingerprint"] = match.join("").replace(/^"(.*)"$/, '$1'); }
tls_pubkey_sha256 = comma "tls-pubkey-sha256" equals match:[^,]+ { proxy["tls-pubkey-sha256"] = match.join("").replace(/^"(.*)"$/, '$1'); }

flow = comma "flow" equals match:[^,]+ { proxy["flow"] = match.join("").replace(/^"(.*)"$/, '$1'); }
public_key = comma "public-key" equals match:[^,]+ { proxy["reality-opts"] = proxy["reality-opts"] || {}; proxy["reality-opts"]["public-key"] = match.join("").replace(/^"(.*)"$/, '$1'); }
short_id = comma "short-id" equals match:[^,]+ { proxy["reality-opts"] = proxy["reality-opts"] || {}; proxy["reality-opts"]["short-id"] = match.join("").replace(/^"(.*)"$/, '$1'); }

fast_open = comma "fast-open" equals flag:bool { proxy.tfo = flag; }
udp_relay = comma "udp" equals flag:bool { proxy.udp = flag; }
ip_mode = comma "ip-mode" equals match:[^,]+ { proxy["ip-version"] = match.join(""); }

ecn = comma "ecn" equals flag:bool { proxy.ecn = flag; }
download_bandwidth = comma "download-bandwidth" equals match:[^,]+ { proxy.down = match.join(""); }
salamander_password = comma "salamander-password" equals match:[^,]+ { proxy['obfs-password'] = match.join(""); proxy.obfs = 'salamander'; }

block_quic = comma "block-quic" equals flag:bool { if(flag) proxy["block-quic"] = "on"; else proxy["block-quic"] = "off"; }

idle_session_check_interval = comma "idle-session-check-interval" equals match:$[0-9]+ { proxy["idle-session-check-interval"] = parseInt(match.trim()); }
idle_session_timeout = comma "idle-session-timeout" equals match:$[0-9]+ { proxy["idle-session-timeout"] = parseInt(match.trim()); }
min_idle_session = comma "min-idle-session" equals match:$[0-9]+ { proxy["min-idle-session"] = parseInt(match.trim()); }
max_stream_count = comma "max-stream-count" equals match:$[0-9]+ { proxy["max-stream-count"] = parseInt(match.trim()); }

tag = match:[^=,]* { proxy.name = match.join("").trim(); }
comma = _ "," _
equals = _ "=" _
_ = [ \r\t]*
bool = b:("true"/"false") { return b === "true" }
others = comma [^=,]+ equals [^=,]+
`;
var parser2;
function getParser2() {
  if (!parser2) {
    parser2 = peggy2.generate(grammars2);
  }
  return parser2;
}

// src/parser/platform/peggy/qx.js
var peggy3 = __toESM(require_peg(), 1);
var grammars3 = String.raw`
// global initializer
{{
    function $set(obj, path, value) {
      if (Object(obj) !== obj) return obj;
      if (!Array.isArray(path)) path = path.toString().match(/[^.[\]]+/g) || [];
      path
        .slice(0, -1)
        .reduce((a, c, i) => (Object(a[c]) === a[c] ? a[c] : (a[c] = Math.abs(path[i + 1]) >> 0 === +path[i + 1] ? [] : {})), obj)[
        path[path.length - 1]
      ] = value;
      return obj;
    }
}}

// per-parse initializer
{
	const proxy = {};
    const obfs = {};
    const $ = {};

    function handleObfs() {
        if (obfs.type === "ws" || obfs.type === "wss") {
            proxy.network = "ws";
            if (obfs.type === 'wss') {
                proxy.tls = true;
            }
            $set(proxy, "ws-opts.path", obfs.path);
            $set(proxy, "ws-opts.headers.Host", obfs.host);
        } else if (obfs.type === "over-tls") {
            proxy.tls = true;
        } else if (obfs.type === "http") {
            proxy.network = "http";
            $set(proxy, "http-opts.path", obfs.path);
            $set(proxy, "http-opts.headers.Host", obfs.host);
        }
    }
}

start = (trojan/shadowsocks/vmess/vless/http/socks5) {
    return proxy
}

trojan = "trojan" equals address
    (password/over_tls/tls_host/tls_pubkey_sha256/tls_alpn/tls_no_session_ticket/tls_no_session_reuse/tls_fingerprint/tls_verification/obfs/obfs_host/obfs_uri/tag/udp_relay/udp_over_tcp/fast_open/server_check_url/reality_base64_pubkey/reality_hex_shortid/others)* {
    proxy.type = "trojan";
    handleObfs();
}

shadowsocks = "shadowsocks" equals address
    (password/method/obfs_ssr/obfs_ss/obfs_host/obfs_uri/ssr_protocol/ssr_protocol_param/tls_pubkey_sha256/tls_alpn/tls_no_session_ticket/tls_no_session_reuse/tls_fingerprint/tls_verification/udp_relay/udp_over_tcp_new/fast_open/tag/server_check_url/reality_base64_pubkey/reality_hex_shortid/others)* {
    if (proxy.protocol || proxy.type === "ssr") {
        proxy.type = "ssr";
        if (!proxy.protocol) {
            proxy.protocol = "origin";
        }
        // handle ssr obfs
        if (obfs.host) proxy["obfs-param"] = obfs.host;
        if (obfs.type) proxy.obfs = obfs.type;
    } else {
        proxy.type = "ss";
        // handle ss obfs
        if (obfs.type == "http" || obfs.type === "tls") {
            proxy.plugin = "obfs";
            $set(proxy, "plugin-opts", {
                mode: obfs.type
            });
        } else if (obfs.type === "ws" || obfs.type === "wss") {
            proxy.plugin = "v2ray-plugin";
            $set(proxy, "plugin-opts.mode", "websocket");
            if (obfs.type === "wss") {
                $set(proxy, "plugin-opts.tls", true);
            }
        } else if (obfs.type === 'over-tls') {
            throw new Error('ss over-tls is not supported');
        }
        if (obfs.type) {
            $set(proxy, "plugin-opts.host", obfs.host);
            $set(proxy, "plugin-opts.path", obfs.path);
        }
    }
}

vmess = "vmess" equals address
    (uuid/method/over_tls/tls_host/tls_pubkey_sha256/tls_alpn/tls_no_session_ticket/tls_no_session_reuse/tls_fingerprint/tls_verification/tag/obfs/obfs_host/obfs_uri/udp_relay/udp_over_tcp/fast_open/aead/server_check_url/reality_base64_pubkey/reality_hex_shortid/others)* {
    proxy.type = "vmess";
    proxy.cipher = proxy.cipher || "none";
    if (proxy.aead === false) {
        proxy.alterId = 1;
    } else {
        proxy.alterId = 0;
    }
    handleObfs();
}

vless = "vless" equals address
    (uuid/method/over_tls/tls_host/tls_pubkey_sha256/tls_alpn/tls_no_session_ticket/tls_no_session_reuse/tls_fingerprint/tls_verification/tag/obfs/obfs_host/obfs_uri/udp_relay/udp_over_tcp/fast_open/aead/server_check_url/reality_base64_pubkey/reality_hex_shortid/vless_flow/others)* {
    proxy.type = "vless";
    proxy.cipher = proxy.cipher || "none";
    handleObfs();
}

http = "http" equals address 
    (username/password/over_tls/tls_host/tls_pubkey_sha256/tls_alpn/tls_no_session_ticket/tls_no_session_reuse/tls_fingerprint/tls_verification/tag/fast_open/udp_relay/udp_over_tcp/server_check_url/reality_base64_pubkey/reality_hex_shortid/others)*{
    proxy.type = "http";
}

socks5 = "socks5" equals address
    (username/password/password/over_tls/tls_host/tls_pubkey_sha256/tls_alpn/tls_no_session_ticket/tls_no_session_reuse/tls_fingerprint/tls_verification/tag/fast_open/udp_relay/udp_over_tcp/server_check_url/reality_base64_pubkey/reality_hex_shortid/others)* {
    proxy.type = "socks5";
}
    
address = server:server ":" port:port {
    proxy.server = server;
    proxy.port = port;
}
server = ip/domain

domain = match:[0-9a-zA-z-_.]+ { 
    const domain = match.join(""); 
    if (/(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]/.test(domain)) {
        return domain;
    }
}

ip = & {
    const start = peg$currPos;
    let end;
    let j = start;
    while (j < input.length) {
        if (input[j] === ",") break;
        if (input[j] === ":") end = j;
        j++;
    }
    peg$currPos = end || j;
    $.ip = input.substring(start, end).trim();
    return true;
} { return $.ip; }

port = digits:[0-9]+ { 
    const port = parseInt(digits.join(""), 10); 
    if (port >= 0 && port <= 65535) {
    	return port;
    }
}

username = comma "username" equals username:[^,]+ { proxy.username = username.join("").trim(); }
password = comma "password" equals password:[^,]+ { proxy.password = password.join("").trim(); }
uuid = comma "password" equals uuid:[^,]+ { proxy.uuid = uuid.join("").trim(); }

method = comma "method" equals cipher:cipher { 
    proxy.cipher = cipher;
};
cipher = ("aes-128-cfb"/"aes-128-ctr"/"aes-128-gcm"/"aes-192-cfb"/"aes-192-ctr"/"aes-192-gcm"/"aes-256-cfb"/"aes-256-ctr"/"aes-256-gcm"/"bf-cfb"/"cast5-cfb"/"chacha20-ietf-poly1305"/"chacha20-ietf"/"chacha20-poly1305"/"chacha20"/"des-cfb"/"none"/"rc2-cfb"/"rc4-md5-6"/"rc4-md5"/"salsa20"/"xchacha20-ietf-poly1305"/"2022-blake3-aes-128-gcm"/"2022-blake3-aes-256-gcm");
aead = comma "aead" equals flag:bool { proxy.aead = flag; }

udp_relay = comma "udp-relay" equals flag:bool { proxy.udp = flag; }
udp_over_tcp = comma "udp-over-tcp" equals flag:bool { throw new Error("UDP over TCP is not supported"); }
udp_over_tcp_new = comma "udp-over-tcp" equals param:$[^=,]+ { if (param === "sp.v1") { proxy["udp-over-tcp"] = true; proxy["udp-over-tcp-version"] = 1; } else if (param === "sp.v2") { proxy["udp-over-tcp"] = true; proxy["udp-over-tcp-version"] = 2; } else if (param === "true") { proxy["_ssr_python_uot"] = true; } else { throw new Error("Invalid value for udp-over-tcp"); } }

fast_open = comma "fast-open" equals flag:bool { proxy.tfo = flag; }

over_tls = comma "over-tls" equals flag:bool { proxy.tls = flag; }
tls_host = comma "tls-host" equals sni:domain { proxy.sni = sni; }
tls_verification = comma "tls-verification" equals flag:bool { 
    proxy["skip-cert-verify"] = !flag;
}
tls_fingerprint = comma "tls-cert-sha256" equals tls_fingerprint:$[^,]+ { proxy["tls-fingerprint"] = tls_fingerprint.trim(); }
tls_pubkey_sha256 = comma "tls-pubkey-sha256" equals param:$[^=,]+ { proxy["tls-pubkey-sha256"] = param; }
tls_alpn = comma "tls-alpn" equals param:$[^=,]+ { proxy["tls-alpn"] = param; }
tls_no_session_ticket = comma "tls-no-session-ticket" equals flag:bool { 
    proxy["tls-no-session-ticket"] = flag;
}
tls_no_session_reuse = comma "tls-no-session-reuse" equals flag:bool { 
    proxy["tls-no-session-reuse"] = flag;
}

obfs_ss = comma "obfs" equals type:("http"/"tls"/"wss"/"ws"/"over-tls") { obfs.type = type; return type; }
obfs_ssr = comma "obfs" equals type:("plain"/"http_simple"/"http_post"/"random_head"/"tls1.2_ticket_auth"/"tls1.2_ticket_fastauth") { proxy.type = "ssr"; obfs.type = type; return type; }
obfs = comma "obfs" equals type:("wss"/"ws"/"over-tls"/"http") { obfs.type = type; return type; };

obfs_host = comma "obfs-host" equals host:domain { obfs.host = host; }
obfs_uri = comma "obfs-uri" equals uri:uri { obfs.path = uri; }

ssr_protocol = comma "ssr-protocol" equals protocol:("origin"/"auth_sha1_v4"/"auth_aes128_md5"/"auth_aes128_sha1"/"auth_chain_a"/"auth_chain_b") { proxy.protocol = protocol; return protocol; }
ssr_protocol_param = comma "ssr-protocol-param" equals param:$[^=,]+ { proxy["protocol-param"] = param; }

reality_base64_pubkey = comma "reality-base64-pubkey" equals param:$[^=,]+ {
    $set(proxy, "reality-opts.public-key", param);
 }
reality_hex_shortid = comma "reality-hex-shortid" equals param:$[^=,]+ {
    $set(proxy, "reality-opts.short-id", param);
}

vless_flow = comma "vless-flow" equals param:$[^=,]+ { proxy["flow"] = param; }
server_check_url = comma "server_check_url" equals param:$[^=,]+ { proxy["test-url"] = param; }

uri = $[^,]+

tag = comma "tag" equals tag:[^=,]+ { proxy.name = tag.join(""); }
others = comma [^=,]+ equals [^=,]+
comma = _ "," _
equals = _ "=" _
_ = [ \r\t]*
bool = b:("true"/"false") { return b === "true" }
`;
var parser3;
function getParser3() {
  if (!parser3) {
    parser3 = peggy3.generate(grammars3);
  }
  return parser3;
}

// src/parser/platform/parse-platform-proxy-line.ts
function isRecord4(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
function pickString(value) {
  return typeof value === "string" ? value.trim() : "";
}
function pickNumber(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return null;
}
function extractSurgePortHopping(raw) {
  const match = raw.match(
    /,\s*?port-hopping\s*?=\s*?["']?\s*?((\d+(-\d+)?)([,;]\d+(-\d+)?)*)\s*?["']?\s*?/i
  ) || [];
  const ports = typeof match[1] === "string" && match[1].trim() ? match[1].trim().replace(/;/g, ",") : void 0;
  const removed = typeof match[0] === "string" && match[0] ? raw.replace(match[0], "") : raw;
  return { line: removed, ports };
}
function normalizeWsEarlyDataInPlace(proxy) {
  if (pickString(proxy.network) !== "ws") return;
  const wsOpts = proxy["ws-opts"];
  if (!isRecord4(wsOpts)) return;
  const path = pickString(wsOpts.path);
  if (!path) return;
  const { path: wsPath, earlyData } = splitWsPathEarlyData(path);
  if (earlyData === void 0) return;
  wsOpts.path = wsPath;
  wsOpts["early-data-header-name"] = "Sec-WebSocket-Protocol";
  wsOpts["max-early-data"] = earlyData;
}
function parseEndpoint(raw) {
  const value = raw.trim().replace(/^"|"$/g, "");
  if (!value) return null;
  const idx = value.lastIndexOf(":");
  if (idx === -1) return null;
  const server = value.slice(0, idx).replace(/^\[/, "").replace(/\]$/, "").trim();
  const port = Number.parseInt(value.slice(idx + 1), 10);
  if (!server || !Number.isInteger(port) || port <= 0 || port > 65535) return null;
  return { server, port };
}
function parseReserved(value) {
  const normalized = value.trim().replace(/^\[/, "").replace(/\]$/, "").replace(/^"|"$/g, "");
  if (!normalized) return void 0;
  const list = normalized.split(/[\/,]/).map((item) => Number.parseInt(item.trim(), 10)).filter((item) => Number.isInteger(item));
  return list.length > 0 ? list : void 0;
}
function splitCsv(value) {
  return value.split(",").map((item) => item.trim().replace(/^"|"$/g, "")).filter(Boolean);
}
function parsePeerKvString(raw) {
  const out = {};
  const regex = /([a-z-]+)\s*=\s*([^"(),]+|".*?")/gi;
  for (const match of Array.from(raw.matchAll(regex))) {
    const key = match[1]?.trim().toLowerCase();
    const value = match[2]?.trim().replace(/^"|"$/g, "");
    if (key && value) out[key] = value;
  }
  return out;
}
function parsePeerList(raw) {
  const peers = [];
  for (const match of Array.from(raw.matchAll(/\((.*?)\)/g))) {
    const kv = parsePeerKvString(match[1] || "");
    const endpoint = kv.endpoint ? parseEndpoint(kv.endpoint) : null;
    const reserved = kv.reserved ? parseReserved(kv.reserved) : kv["client-id"] ? parseReserved(kv["client-id"]) : void 0;
    peers.push({
      ...endpoint ? { server: endpoint.server, port: endpoint.port } : {},
      ...kv["public-key"] ? { "public-key": kv["public-key"] } : {},
      ...kv["pre-shared-key"] ? { "pre-shared-key": kv["pre-shared-key"] } : {},
      ...kv["allowed-ips"] ? { "allowed-ips": splitCsv(kv["allowed-ips"]) } : {},
      ...reserved ? { reserved } : {}
    });
  }
  return peers;
}
function findSectionLines(sections, name) {
  if (!sections) return void 0;
  const target = name.trim().toLowerCase();
  for (const [sectionName, lines] of Array.from(sections.entries())) {
    if (sectionName.trim().toLowerCase() === target) return lines;
  }
  return void 0;
}
function parseIniAssignments(lines) {
  const out = {};
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#") || line.startsWith(";")) continue;
    const idx = line.indexOf("=");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim().toLowerCase();
    const value = line.slice(idx + 1).trim();
    if (!key) continue;
    out[key] = value;
  }
  return out;
}
function parseLoonWireGuardLine(line) {
  const name = line.match(/(^.*?)\s*?=\s*?wireguard\s*?,.+?\s*?=\s*?.+?/i)?.[1]?.trim();
  if (!name) return null;
  const peersRaw = line.match(/,\s*?peers\s*?=\s*?\[\s*?\{\s*?(.+?)\s*?\}\s*?\]/i)?.[1];
  if (!peersRaw) return null;
  const endpointMatch = peersRaw.match(/(,|^)\s*?endpoint\s*?=\s*?"?(.+?):(\d+)"?\s*?(,|$)/i);
  const server = endpointMatch?.[2]?.trim();
  const port = endpointMatch?.[3] ? Number.parseInt(endpointMatch[3], 10) : null;
  if (!server || port === null || !Number.isInteger(port) || port <= 0 || port > 65535) return null;
  const mtuRaw = line.match(/(,|^)\s*?mtu\s*?=\s*?"?(\d+?)"?\s*?(,|$)/i)?.[2];
  const keepaliveRaw = line.match(/(,|^)\s*?keepalive\s*?=\s*?"?(\d+?)"?\s*?(,|$)/i)?.[2];
  const reservedRaw = peersRaw.match(/(,|^)\s*?reserved\s*?=\s*?"?(\[\s*?.+?\s*?\])"?\s*?(,|$)/i)?.[2];
  const allowedIps = peersRaw.match(/(,|^)\s*?allowed-ips\s*?=\s*?"(.+?)"\s*?(,|$)/i)?.[2];
  const preSharedKey = peersRaw.match(/(,|^)\s*?preshared-key\s*?=\s*?"?(.+?)"?\s*?(,|$)/i)?.[2];
  const publicKey = peersRaw.match(/(,|^)\s*?public-key\s*?=\s*?"?(.+?)"?\s*?(,|$)/i)?.[2];
  const dns = [
    line.match(/(,|^)\s*?dns\s*?=\s*?"?(.+?)"?\s*?(,|$)/i)?.[2],
    line.match(/(,|^)\s*?dnsv6\s*?=\s*?"?(.+?)"?\s*?(,|$)/i)?.[2]
  ].filter((v) => Boolean(v)).map((v) => v.trim());
  return {
    type: "wireguard",
    name,
    server,
    port,
    ip: line.match(/(,|^)\s*?interface-ip\s*?=\s*?"?(.+?)"?\s*?(,|$)/i)?.[2],
    ipv6: line.match(/(,|^)\s*?interface-ipv6\s*?=\s*?"?(.+?)"?\s*?(,|$)/i)?.[2],
    "private-key": line.match(/(,|^)\s*?private-key\s*?=\s*?"?(.+?)"?\s*?(,|$)/i)?.[2],
    ...publicKey ? { "public-key": publicKey } : {},
    ...preSharedKey ? { "pre-shared-key": preSharedKey } : {},
    ...mtuRaw ? { mtu: Number.parseInt(mtuRaw, 10) } : {},
    ...keepaliveRaw ? { keepalive: Number.parseInt(keepaliveRaw, 10) } : {},
    ...reservedRaw ? { reserved: parseReserved(reservedRaw) } : {},
    ...allowedIps ? { "allowed-ips": splitCsv(allowedIps) } : {},
    ...dns.length > 0 ? { dns, "remote-dns-resolve": true } : {},
    udp: true,
    peers: [
      {
        server,
        port,
        ...publicKey ? { "public-key": publicKey } : {},
        ...preSharedKey ? { "pre-shared-key": preSharedKey } : {},
        ...allowedIps ? { "allowed-ips": splitCsv(allowedIps) } : {},
        ...reservedRaw ? { reserved: parseReserved(reservedRaw) } : {}
      }
    ]
  };
}
function parseSurgeWireGuardWithContext(proxy, sections) {
  const sectionName = pickString(proxy["section-name"]);
  if (!sectionName) throw new Error("Surge WireGuard \u7F3A\u5C11 section-name");
  const lines = findSectionLines(sections, `WireGuard ${sectionName}`);
  if (!lines || lines.length === 0) throw new Error(`\u672A\u627E\u5230 WireGuard section: ${sectionName}`);
  const assignments = parseIniAssignments(lines);
  const peers = parsePeerList(assignments.peer || "");
  const firstPeer = peers[0] && isRecord4(peers[0]) ? peers[0] : {};
  const server = pickString(firstPeer.server);
  const port = pickNumber(firstPeer.port);
  if (!server || port === null || !Number.isInteger(port) || port <= 0 || port > 65535) {
    throw new Error(`WireGuard section ${sectionName} \u7F3A\u5C11\u6709\u6548 endpoint`);
  }
  const dns = assignments["dns-server"] ? splitCsv(assignments["dns-server"]) : void 0;
  const mtu = assignments.mtu ? Number.parseInt(assignments.mtu, 10) : void 0;
  const keepalive = assignments.keepalive ? Number.parseInt(assignments.keepalive, 10) : void 0;
  return {
    type: "wireguard",
    name: pickString(proxy.name) || `WireGuard-${sectionName}`,
    server,
    port,
    ip: assignments["self-ip"] || void 0,
    ipv6: assignments["self-ip-v6"] || void 0,
    "private-key": assignments["private-key"] || void 0,
    ...pickString(firstPeer["public-key"]) ? { "public-key": pickString(firstPeer["public-key"]) } : {},
    ...pickString(firstPeer["pre-shared-key"]) ? { "pre-shared-key": pickString(firstPeer["pre-shared-key"]) } : {},
    ...Number.isInteger(mtu) ? { mtu } : {},
    ...Number.isInteger(keepalive) ? { keepalive } : {},
    ...Array.isArray(firstPeer.reserved) ? { reserved: firstPeer.reserved } : {},
    ...dns && dns.length > 0 ? { dns, "remote-dns-resolve": true } : {},
    ...Array.isArray(firstPeer["allowed-ips"]) ? { "allowed-ips": firstPeer["allowed-ips"] } : {},
    udp: true,
    peers
  };
}
function normalizePlatformProxyInPlace(proxy) {
  const rawType = pickString(proxy.type).toLowerCase();
  if (!rawType) throw new Error("\u5E73\u53F0\u4EE3\u7406\u884C\u7F3A\u5C11 type");
  if (rawType === "http" && proxy.tls === true) proxy.type = "https";
  normalizeWsEarlyDataInPlace(proxy);
  const keystorePrivateKey = pickString(proxy["keystore-private-key"]);
  if (keystorePrivateKey) {
    proxy["private-key"] = keystorePrivateKey;
    delete proxy["keystore-private-key"];
  }
  const tlsFingerprint = pickString(proxy["tls-fingerprint"]);
  if (tlsFingerprint) {
    const type3 = pickString(proxy.type).toLowerCase();
    if (["vmess", "vless", "trojan", "anytls"].includes(type3) && !pickString(proxy["client-fingerprint"])) proxy["client-fingerprint"] = tlsFingerprint;
    if (type3 === "hysteria2" && !pickString(proxy.fingerprint)) proxy.fingerprint = tlsFingerprint;
    if (type3 === "ssh" && !pickString(proxy["server-fingerprint"])) proxy["server-fingerprint"] = tlsFingerprint;
    delete proxy["tls-fingerprint"];
  }
  const sni = pickString(proxy.sni);
  const type2 = pickString(proxy.type).toLowerCase();
  if (sni && (type2 === "vmess" || type2 === "vless") && !pickString(proxy.servername)) {
    proxy.servername = sni;
    delete proxy.sni;
  }
  if (type2 === "anytls") {
    const network = pickString(proxy.network).toLowerCase();
    if (network && network !== "tcp") {
      throw new Error(`AnyTLS \u5E73\u53F0\u914D\u7F6E\u4E0D\u652F\u6301 network=${network}\uFF08Mihomo \u4EC5\u652F\u6301\u7EAF TCP\uFF09`);
    }
    if (proxy["reality-opts"] || pickString(proxy.security).toLowerCase() === "reality") {
      throw new Error("AnyTLS \u5E73\u53F0\u914D\u7F6E\u4E0D\u652F\u6301 Reality \u53C2\u6570\uFF08Mihomo \u4E0D\u652F\u6301\uFF09");
    }
    if (pickString(proxy.servername) && !pickString(proxy.sni)) {
      proxy.sni = pickString(proxy.servername);
      delete proxy.servername;
    }
  }
}
function ensureCoreFields(proxy, kind) {
  const name = pickString(proxy.name);
  const type2 = pickString(proxy.type).toLowerCase();
  if (!name) throw new Error(`${kind} \u4EE3\u7406\u884C\u7F3A\u5C11 name`);
  if (!type2) throw new Error(`${kind} \u4EE3\u7406\u884C\u7F3A\u5C11 type`);
  if (type2 === "trusttunnel" || type2 === "direct" || type2 === "external") {
    throw new Error(`\u4E0D\u652F\u6301\u7684\u5E73\u53F0\u4EE3\u7406\u7C7B\u578B: ${type2}`);
  }
  const server = pickString(proxy.server);
  const port = pickNumber(proxy.port);
  if (!server || port === null || !Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`${kind} \u4EE3\u7406\u884C\u7F3A\u5C11 server/port \u6216\u7AEF\u53E3\u65E0\u6548`);
  }
}
function tryParseBy(kind, line) {
  try {
    if (kind === "surge") {
      const { line: nextLine, ports } = extractSurgePortHopping(line);
      const parsed2 = getParser().parse(nextLine);
      if (!isRecord4(parsed2)) return null;
      if (ports) parsed2.ports = ports;
      return parsed2;
    }
    if (kind === "loon") {
      const parsed2 = getParser2().parse(line);
      return isRecord4(parsed2) ? parsed2 : null;
    }
    const parsed = getParser3().parse(line);
    return isRecord4(parsed) ? parsed : null;
  } catch {
    return null;
  }
}
function parsePlatformProxyLine(line, context) {
  const trimmed = line.trim();
  if (!trimmed) return null;
  const customLoonWireGuard = parseLoonWireGuardLine(trimmed);
  if (customLoonWireGuard) {
    normalizePlatformProxyInPlace(customLoonWireGuard);
    ensureCoreFields(customLoonWireGuard, "loon");
    return canonicalizeParsedNode(customLoonWireGuard);
  }
  const bySurge = tryParseBy("surge", trimmed);
  const byLoon = bySurge ? null : tryParseBy("loon", trimmed);
  const byQx = bySurge || byLoon ? null : tryParseBy("qx", trimmed);
  const parsed = bySurge || byLoon || byQx;
  const kind = bySurge ? "surge" : byLoon ? "loon" : byQx ? "qx" : null;
  if (!parsed || !kind) return null;
  const type2 = pickString(parsed.type).toLowerCase();
  const resolved = type2 === "wireguard-surge" ? parseSurgeWireGuardWithContext(parsed, context?.sections) : parsed;
  normalizePlatformProxyInPlace(resolved);
  ensureCoreFields(resolved, kind);
  return canonicalizeParsedNode(resolved);
}

// src/parser/platform/parse-platform-config.ts
function buildParseResult(nodes, errors) {
  return {
    nodes,
    errors,
    totalParsed: nodes.length,
    totalFailed: errors.length
  };
}
function formatParseSegmentError(segment, error) {
  const reason = error instanceof Error ? error.message : "\u672A\u77E5\u9519\u8BEF";
  return `\u89E3\u6790\u5931\u8D25: ${segment.substring(0, 80)}... - ${reason}`;
}
function buildSectionMap(content) {
  const sections = /* @__PURE__ */ new Map();
  const lines = content.split(/\r?\n/);
  let currentSection = "";
  let currentLines = [];
  const flush = () => {
    if (currentSection) sections.set(currentSection, [...currentLines]);
    currentLines = [];
  };
  for (const rawLine of lines) {
    const sectionMatch = rawLine.trim().match(/^\[(.+)\]$/);
    if (sectionMatch) {
      flush();
      currentSection = sectionMatch[1].trim();
      continue;
    }
    if (currentSection) currentLines.push(rawLine);
  }
  flush();
  return sections;
}
function isProxySectionName(name) {
  return /^(proxy|server_local|server_remote)$/i.test(name.trim());
}
function isPlatformDirectPolicyLine(line) {
  return /^[^=]+=\s*direct\s*$/i.test(line.trim());
}
function isPlatformConfigSectionHeader(line) {
  return /^\[.+\]$/.test(line);
}
function looksLikePlatformConfigContent(content) {
  const lines = content.split(/[\r\n]+/).map((line) => line.trim()).filter((line) => line && !line.startsWith("#") && !line.startsWith(";"));
  return lines.some((line) => isPlatformConfigSectionHeader(line) && /^\[[ \t]*(?:proxy|server_local|server_remote|wireguard\s+)/i.test(line));
}
function parsePlatformConfigContent(content) {
  const nodes = [];
  const errors = [];
  const sections = buildSectionMap(content);
  for (const [sectionName, sectionLines] of Array.from(sections.entries())) {
    if (!isProxySectionName(sectionName)) continue;
    for (const rawLine of sectionLines) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#") || line.startsWith(";")) continue;
      if (isPlatformDirectPolicyLine(line)) continue;
      try {
        const platformNode = parsePlatformProxyLine(line, { sections });
        if (platformNode) {
          nodes.push(platformNode);
          continue;
        }
      } catch (error) {
        errors.push(formatParseSegmentError(line, error));
        continue;
      }
      try {
        const node = parseConfigLine(line);
        if (node) nodes.push(node);
      } catch (error) {
        errors.push(formatParseSegmentError(line, error));
      }
    }
  }
  return buildParseResult(nodes, errors);
}

// src/parser/protocols/anytls.ts
function parseBool(value) {
  const normalized = value.trim().toLowerCase();
  if (normalized === "1" || normalized === "true") return true;
  if (normalized === "0" || normalized === "false") return false;
  return void 0;
}
function parseIntParam2(params, keys) {
  for (const key of keys) {
    const raw = params.get(key);
    if (!raw) continue;
    const n = Number.parseInt(raw, 10);
    if (Number.isFinite(n)) return n;
  }
  return void 0;
}
function hasUserInfoAuthority(raw) {
  const hashIndex = raw.indexOf("#");
  const beforeHash = hashIndex === -1 ? raw : raw.slice(0, hashIndex);
  const queryIndex = beforeHash.indexOf("?");
  let authority = queryIndex === -1 ? beforeHash : beforeHash.slice(0, queryIndex);
  if (authority.endsWith("/")) authority = authority.slice(0, -1);
  return authority.includes("@");
}
function splitAtFirstQuery(raw) {
  const queryIndex = raw.indexOf("?");
  if (queryIndex === -1) return null;
  return { token: raw.slice(0, queryIndex), suffix: raw.slice(queryIndex) };
}
function isBase64UrlToken(value) {
  if (!value) return false;
  for (const char of value) {
    const ok = char >= "a" && char <= "z" || char >= "A" && char <= "Z" || char >= "0" && char <= "9" || char === "+" || char === "/" || char === "=" || char === "_" || char === "-";
    if (!ok) return false;
  }
  return true;
}
function stripThroughLastColon(value) {
  const colonIndex = value.lastIndexOf(":");
  return colonIndex === -1 ? value : value.slice(colonIndex + 1);
}
function normalizeEncodedUserinfoUri(uri) {
  const raw = uri.slice("anytls://".length).trim();
  if (hasUserInfoAuthority(raw)) {
    return { uri, usedEncodedUserinfo: false };
  }
  const parts = splitAtFirstQuery(raw);
  if (!parts) return { uri, usedEncodedUserinfo: false };
  const token = parts.token.trim();
  if (!isBase64UrlToken(token) || token.includes(".") || token.includes(":")) {
    return { uri, usedEncodedUserinfo: false };
  }
  const decoded = decodeBase64(token);
  return { uri: `anytls://${decoded}${parts.suffix}`, usedEncodedUserinfo: true };
}
function normalizeAnyTlsSecurity(raw) {
  const value = (raw || "").trim().toLowerCase();
  if (!value || value === "tls" || value === "none") return "tls";
  if (value === "reality") {
    throw new Error("AnyTLS \u4E0D\u652F\u6301 security=reality / reality-opts\uFF08Mihomo \u4E0D\u652F\u6301\uFF09");
  }
  throw new Error(`AnyTLS \u4E0D\u652F\u6301 security=${raw}`);
}
function normalizeAnyTlsTransport(params) {
  const typeRaw = (params.get("type") || params.get("network") || params.get("transport") || "").trim();
  const normalized = typeRaw.toLowerCase();
  if (!normalized || normalized === "tcp" || normalized === "none") {
    const headerType = (params.get("headerType") || params.get("header_type") || params.get("header-type") || "").trim().toLowerCase();
    if (headerType && headerType !== "none") {
      throw new Error(`AnyTLS \u4E0D\u652F\u6301 headerType=${headerType}\uFF08\u4EC5\u652F\u6301\u7EAF TCP\uFF09`);
    }
    return "tcp";
  }
  throw new Error(`AnyTLS \u4E0D\u652F\u6301 type=${typeRaw}\uFF08Mihomo \u4EC5\u652F\u6301\u7EAF TCP\uFF09`);
}
function rejectUnsupportedAnyTlsAdvancedParams(params) {
  const unsupportedRealityParams = [
    "pbk",
    "sid",
    "spx",
    "public-key",
    "public_key",
    "publicKey",
    "short-id",
    "short_id",
    "shortId"
  ];
  const unsupportedTransportParams = [
    "serviceName",
    "service_name",
    "service-name",
    "authority",
    "host",
    "path",
    "seed",
    "mode"
  ];
  const foundReality = unsupportedRealityParams.filter((key) => params.has(key));
  if (foundReality.length > 0) {
    throw new Error(`AnyTLS \u4E0D\u652F\u6301 Reality \u53C2\u6570: ${foundReality.join(", ")}`);
  }
  const foundTransport = unsupportedTransportParams.filter((key) => params.has(key));
  if (foundTransport.length > 0) {
    throw new Error(`AnyTLS \u4E0D\u652F\u6301\u4F20\u8F93\u5C42\u53C2\u6570: ${foundTransport.join(", ")}\uFF08Mihomo \u4EC5\u652F\u6301\u7EAF TCP\uFF09`);
  }
}
function parseAnyTLS(uri) {
  if (!uri.startsWith("anytls://")) {
    throw new Error("\u65E0\u6548\u7684 AnyTLS \u94FE\u63A5");
  }
  const normalized = normalizeEncodedUserinfoUri(uri);
  const url = parseUrlWithNeutralScheme(normalized.uri);
  const params = url.searchParams;
  const password = (() => {
    const user = safeDecodeURIComponent(url.username);
    const pass = safeDecodeURIComponent(url.password);
    if (user || pass) {
      const merged = pass ? `${user}:${pass}` : user;
      return normalized.usedEncodedUserinfo ? stripThroughLastColon(merged) : merged;
    }
    return (params.get("password") || params.get("auth") || params.get("auth_str") || params.get("auth-str") || "").trim();
  })();
  const server = url.hostname;
  const port = Number.parseInt(url.port || "443", 10);
  const name = safeDecodeFormUrlEncoded(url.hash.slice(1)) || safeDecodeFormUrlEncoded(params.get("remarks") || params.get("remark") || "") || `AnyTLS-${server}:${port}`;
  if (!password || !server) {
    throw new Error("AnyTLS \u914D\u7F6E\u7F3A\u5C11\u5FC5\u8981\u5B57\u6BB5");
  }
  if (!Number.isFinite(port) || port <= 0 || port > 65535) {
    throw new Error("\u65E0\u6548\u7684\u7AEF\u53E3\u53F7");
  }
  normalizeAnyTlsSecurity(params.get("security"));
  normalizeAnyTlsTransport(params);
  rejectUnsupportedAnyTlsAdvancedParams(params);
  const sni = params.get("sni") || params.get("peer") || params.get("serverName") || params.get("servername") || server;
  const alpnRaw = params.get("alpn") || "";
  const fp = (params.get("fp") || params.get("fingerprint") || params.get("client-fingerprint") || params.get("clientFingerprint") || "").trim();
  const echPresent = params.has("ech");
  const echValue = echPresent ? (params.get("ech") || "").trim() : "";
  const insecure = params.get("allowInsecure") === "1" || params.get("allowInsecure") === "true" || params.get("allow_insecure") === "1" || params.get("allow_insecure") === "true" || params.get("insecure") === "1" || params.get("insecure") === "true";
  const udp = (() => {
    const raw = params.get("udp");
    if (!raw) return true;
    return parseBool(raw) ?? true;
  })();
  const node = {
    name,
    type: "anytls",
    server,
    port,
    password,
    udp
  };
  if (echPresent) {
    node["ech-opts"] = buildMihomoEchOptsFromShareValue(echValue);
  }
  if (sni) node.sni = sni;
  if (insecure) node["skip-cert-verify"] = true;
  if (fp) node["client-fingerprint"] = fp;
  if (alpnRaw) {
    const list = alpnRaw.split(",").map((s) => s.trim()).filter(Boolean);
    if (list.length > 0) node.alpn = list;
  }
  if (params.get("pcs")) {
    node.pcs = params.get("pcs");
  }
  if (params.get("pqv")) {
    node.pqv = params.get("pqv");
  }
  const idleSessionCheckInterval = parseIntParam2(params, [
    "idle-session-check-interval",
    "idleSessionCheckInterval"
  ]);
  if (idleSessionCheckInterval !== void 0) {
    node["idle-session-check-interval"] = idleSessionCheckInterval;
  }
  const idleSessionTimeout = parseIntParam2(params, ["idle-session-timeout", "idleSessionTimeout"]);
  if (idleSessionTimeout !== void 0) {
    node["idle-session-timeout"] = idleSessionTimeout;
  }
  const minIdleSession = parseIntParam2(params, ["min-idle-session", "minIdleSession"]);
  if (minIdleSession !== void 0) {
    node["min-idle-session"] = minIdleSession;
  }
  const paddingScheme = (params.get("padding-scheme") || params.get("paddingScheme") || params.get("padding_scheme") || "").trim();
  if (paddingScheme) {
    node["padding-scheme"] = paddingScheme;
  }
  return node;
}

// src/parser/protocols/hysteria.ts
function parseBoolish3(value) {
  if (!value) return void 0;
  const normalized = value.trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;
  return void 0;
}
function parseHysteria(uri) {
  if (!uri.startsWith("hysteria://") && !uri.startsWith("hy://")) {
    throw new Error("\u65E0\u6548\u7684 Hysteria \u94FE\u63A5");
  }
  const normalizedUri = uri.replace(/^hy:\/\//, "hysteria://");
  const url = parseUrlWithNeutralScheme(normalizedUri);
  const params = url.searchParams;
  const server = url.hostname;
  const port = Number.parseInt(url.port || "443", 10);
  const name = safeDecodeFormUrlEncoded(url.hash.slice(1)) || `Hysteria ${server}:${port}`;
  if (!server) {
    throw new Error("Hysteria \u914D\u7F6E\u7F3A\u5C11\u5FC5\u8981\u5B57\u6BB5");
  }
  if (!Number.isFinite(port) || port <= 0 || port > 65535) {
    throw new Error("\u65E0\u6548\u7684\u7AEF\u53E3\u53F7");
  }
  const node = {
    name,
    type: "hysteria",
    server,
    port,
    protocol: params.get("protocol") || "udp"
  };
  const auth = params.get("auth") || params.get("auth_str") || params.get("auth-str") || params.get("password") || "";
  if (auth.trim()) {
    node["auth-str"] = auth.trim();
  }
  const sni = params.get("sni") || params.get("peer") || void 0;
  if (sni) node.sni = sni;
  const insecure = parseBoolish3(params.get("insecure")) ?? parseBoolish3(params.get("allowInsecure"));
  if (insecure !== void 0) node["skip-cert-verify"] = insecure;
  const alpn = params.get("alpn");
  if (alpn) {
    const list = alpn.split(",").map((item) => item.trim()).filter(Boolean);
    if (list.length > 0) node.alpn = list;
  }
  const up = params.get("upmbps") || params.get("up") || void 0;
  if (up) node.up = up;
  const down = params.get("downmbps") || params.get("down") || void 0;
  if (down) node.down = down;
  const mport = params.get("mport") || params.get("ports") || void 0;
  if (mport) node.ports = mport;
  const obfsParam = params.get("obfsParam") || params.get("obfs-param") || void 0;
  if (obfsParam) node.obfs = obfsParam;
  const obfs = params.get("obfs");
  if (obfs !== null) {
    node["_obfs"] = obfs;
  }
  const tfo = parseBoolish3(params.get("fast-open"));
  if (tfo !== void 0) node.tfo = tfo;
  return node;
}

// src/parser/protocols/hysteria2.ts
function parseHopIntervalParam(params, keys) {
  for (const key of keys) {
    const raw = params.get(key)?.trim();
    if (!raw) continue;
    if (/^\d+$/.test(raw)) {
      const value = Number.parseInt(raw, 10);
      if (Number.isFinite(value) && value > 0) return value;
      continue;
    }
    const range = /^(\d+)-(\d+)$/.exec(raw);
    if (!range) continue;
    const min = Number.parseInt(range[1], 10);
    const max = Number.parseInt(range[2], 10);
    if (Number.isFinite(min) && Number.isFinite(max) && min > 0 && max >= min) {
      return `${min}-${max}`;
    }
  }
  return void 0;
}
function trimTrailingSlashes2(value) {
  let end = value.length;
  while (end > 0 && value[end - 1] === "/") end -= 1;
  return end === value.length ? value : value.slice(0, end);
}
function splitAuthority(value) {
  const raw = trimTrailingSlashes2(value.trim());
  if (!raw) return { userInfo: "", server: "", portSpec: "" };
  const atIndex = raw.lastIndexOf("@");
  const userInfo = atIndex === -1 ? "" : raw.slice(0, atIndex);
  const hostPort = atIndex === -1 ? raw : raw.slice(atIndex + 1);
  if (hostPort.startsWith("[")) {
    const end = hostPort.indexOf("]");
    if (end !== -1) {
      const server = hostPort.slice(1, end);
      const rest = hostPort.slice(end + 1);
      if (rest.startsWith(":")) {
        return { userInfo, server, portSpec: trimTrailingSlashes2(rest.slice(1)) };
      }
      return { userInfo, server, portSpec: "" };
    }
  }
  const colonIndex = hostPort.lastIndexOf(":");
  if (colonIndex === -1) {
    return { userInfo, server: hostPort, portSpec: "" };
  }
  return {
    userInfo,
    server: hostPort.slice(0, colonIndex),
    portSpec: trimTrailingSlashes2(hostPort.slice(colonIndex + 1))
  };
}
function parseHysteria2(uri) {
  if (!uri.startsWith("hysteria2://") && !uri.startsWith("hy2://")) {
    throw new Error("\u65E0\u6548\u7684 Hysteria2 \u94FE\u63A5");
  }
  const normalizedUri = uri.replace(/^hy2:\/\//, "hysteria2://");
  const rest = normalizedUri.replace(/^hysteria2:\/\//, "");
  const hashIndex = rest.indexOf("#");
  const hash = hashIndex === -1 ? "" : rest.slice(hashIndex + 1);
  const withoutHash = hashIndex === -1 ? rest : rest.slice(0, hashIndex);
  const queryIndex = withoutHash.indexOf("?");
  const authority = (queryIndex === -1 ? withoutHash : withoutHash.slice(0, queryIndex)).trim();
  const queryString = queryIndex === -1 ? "" : withoutHash.slice(queryIndex + 1);
  const params = new URLSearchParams(queryString);
  const name = safeDecodeFormUrlEncoded(hash) || "Hysteria2 \u8282\u70B9";
  const { userInfo, server: authorityServer, portSpec } = splitAuthority(authority);
  const server = authorityServer.trim();
  const password = (() => {
    const user = safeDecodeURIComponent(userInfo);
    if (user) return user;
    const fromQuery = params.get("password") || params.get("auth") || params.get("auth_str") || params.get("auth-str") || "";
    return fromQuery.trim();
  })();
  if (!password || !server) {
    throw new Error("Hysteria2 \u914D\u7F6E\u7F3A\u5C11\u5FC5\u8981\u5B57\u6BB5");
  }
  const queryPortsRaw = (params.get("ports") || params.get("mport") || "").trim();
  const authorityPortsRaw = portSpec && !/^\d+$/.test(portSpec) ? portSpec : "";
  const ports = queryPortsRaw ? normalizePortsSpec(queryPortsRaw) : authorityPortsRaw ? normalizePortsSpec(authorityPortsRaw) : void 0;
  const port = (() => {
    if (portSpec && /^\d+$/.test(portSpec)) {
      const p = Number.parseInt(portSpec, 10);
      if (!Number.isFinite(p) || p <= 0 || p > 65535) throw new Error("\u65E0\u6548\u7684\u7AEF\u53E3\u53F7");
      return p;
    }
    if (ports) return pickStablePortFromPorts(ports);
    return 443;
  })();
  const sni = params.get("sni") || params.get("peer") || server;
  const insecure = params.get("insecure") === "1" || params.get("insecure") === "true" || params.get("allowInsecure") === "1" || params.get("allowInsecure") === "true" || params.get("allow_insecure") === "1" || params.get("allow_insecure") === "true";
  const obfs = params.get("obfs") || void 0;
  const obfsPassword = params.get("obfs-password") || params.get("obfs_password") || params.get("obfsPassword") || void 0;
  const portsFromQuery = ports;
  const alpnRaw = (params.get("alpn") || "").trim();
  const fingerprint = (params.get("fp") || params.get("fingerprint") || params.get("pinSHA256") || "").trim();
  const hopInterval = parseHopIntervalParam(params, ["hop-interval", "hop_interval", "hopInterval"]);
  const mldsa65Seed = params.get("mldsa65-seed") || params.get("mldsa65_seed") || params.get("mldsa65Seed") || void 0;
  const up = params.get("up") || params.get("upmbps") || void 0;
  const down = params.get("down") || params.get("downmbps") || void 0;
  const node = {
    name,
    type: "hysteria2",
    server,
    port,
    password,
    sni
  };
  if (insecure) {
    node["skip-cert-verify"] = true;
  }
  if (obfs && obfs === "salamander" && !obfsPassword) {
    throw new Error("Hysteria2 salamander obfs \u7F3A\u5C11 obfs-password");
  }
  if (obfs && obfs === "salamander") {
    node.obfs = obfs;
    if (obfsPassword) {
      node["obfs-password"] = obfsPassword;
    }
  }
  if (alpnRaw) {
    const list = alpnRaw.split(",").map((s) => s.trim()).filter(Boolean);
    if (list.length > 0) node.alpn = list;
  }
  if (fingerprint) {
    node.fingerprint = fingerprint;
  }
  if (up) {
    node.up = /[kmg]?bps$/i.test(up) ? up : `${up} mbps`;
  }
  if (down) {
    node.down = /[kmg]?bps$/i.test(down) ? down : `${down} mbps`;
  }
  if (portsFromQuery) {
    node.ports = portsFromQuery.trim() || void 0;
  }
  if (hopInterval !== void 0) {
    node["hop-interval"] = hopInterval;
  }
  if (mldsa65Seed) {
    node["mldsa65-seed"] = mldsa65Seed;
  }
  return node;
}

// src/parser/protocols/simple-proxy.ts
function takeTerminalEnclosedValue(input, open, close) {
  if (!input.endsWith(close)) return { value: input };
  const openIndex = input.lastIndexOf(open);
  if (openIndex === -1) return { value: input };
  const enclosed = input.slice(openIndex + open.length, input.length - close.length);
  if (enclosed.includes(close)) return { value: input };
  return {
    value: input.slice(0, openIndex),
    enclosed
  };
}
function stripMetaSuffix(input) {
  let remaining = input.trim();
  let name;
  const brace = takeTerminalEnclosedValue(remaining, "{", "}");
  if (brace.enclosed !== void 0) {
    name = brace.enclosed;
    remaining = brace.value;
  }
  const bracket = takeTerminalEnclosedValue(remaining, "[", "]");
  const bracketIsIpv6Host = bracket.enclosed?.includes(":") && (remaining.startsWith("[") || /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\/(?:[^/?#@]+@)?\[[^\]]+\]$/.test(remaining));
  if (bracket.enclosed !== void 0 && !bracketIsIpv6Host) {
    remaining = bracket.value;
  }
  return { value: remaining, name };
}
var DEFAULT_PORTS = {
  http: 80,
  https: 443,
  socks4: 1080,
  socks5: 1080,
  ssh: 22
};
var SCHEME_MAP = {
  http: "http",
  https: "https",
  socks: "socks5",
  socks4: "socks4",
  socks5: "socks5",
  "socks5+tls": "socks5",
  ssh: "ssh"
};
function parseSimpleProxy(input, defaultType = "http") {
  const trimmed = input.trim();
  const schemeMatch = trimmed.match(/^([a-zA-Z][a-zA-Z0-9+.-]*):\/\//);
  if (schemeMatch) {
    const scheme = schemeMatch[1].toLowerCase();
    const proxyType = SCHEME_MAP[scheme];
    if (!proxyType) {
      throw new Error(`\u4E0D\u652F\u6301\u7684\u534F\u8BAE: ${scheme}`);
    }
    return parseStandardUrl(trimmed, proxyType, { forceTls: scheme === "socks5+tls" });
  }
  return parseNakedFormat(trimmed, defaultType);
}
function looksLikeBase64Token(value) {
  const v = value.trim();
  if (!v) return false;
  return /^[A-Za-z0-9+/=_-]+$/.test(v);
}
function tryDecodeBase64Token(value) {
  const v = value.trim();
  if (!looksLikeBase64Token(v)) return null;
  try {
    const decoded = decodeBase64(v);
    if (/[\x00-\x08\x0E-\x1F]/.test(decoded)) return null;
    return decoded;
  } catch {
    return null;
  }
}
function parseUserPassAuth(auth) {
  const raw = auth.trim();
  if (!raw) return {};
  const idx = raw.indexOf(":");
  if (idx === -1) return { username: raw };
  return { username: raw.slice(0, idx), password: raw.slice(idx + 1) };
}
function parseBoolish4(value) {
  if (!value) return void 0;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return void 0;
  if (normalized === "1" || normalized === "true" || normalized === "yes" || normalized === "on") return true;
  if (normalized === "0" || normalized === "false" || normalized === "no" || normalized === "off") return false;
  return void 0;
}
function parseHeadersParam(value) {
  const raw = value.trim();
  if (!raw) return void 0;
  const jsonHeaders = parseJsonStringMap(raw);
  if (jsonHeaders) return jsonHeaders;
  if (parseJsonObject(raw)) return void 0;
  const out = {};
  for (const part of raw.split("|")) {
    const p = part.trim();
    if (!p) continue;
    const idx = p.indexOf(":");
    if (idx === -1) continue;
    const key = p.slice(0, idx).trim();
    const val = p.slice(idx + 1).trim();
    if (!key) continue;
    out[key] = val;
  }
  return Object.keys(out).length > 0 ? out : void 0;
}
function applyStandardUrlQueryParams(node, params) {
  const sni = (params.get("sni") || params.get("peer") || params.get("tls-name") || params.get("tls_name") || "").trim();
  const allowInsecure = parseBoolish4(params.get("skip-cert-verify")) ?? parseBoolish4(params.get("skip_cert_verify")) ?? parseBoolish4(params.get("allowInsecure")) ?? parseBoolish4(params.get("allow_insecure")) ?? parseBoolish4(params.get("allow-insecure")) ?? parseBoolish4(params.get("insecure"));
  const tlsVerification = (() => {
    const raw = params.get("tls-verification");
    const parsed = parseBoolish4(raw);
    return parsed !== void 0 ? parsed : void 0;
  })();
  const hostKeyRaw = (params.get("host-key") || params.get("host_key") || params.get("hostKey") || "").trim();
  const privateKeyRaw = (params.get("private-key") || params.get("private_key") || params.get("privateKey") || "").trim();
  if (node.type === "http" || node.type === "https") {
    if (sni) node.sni = sni;
    if (allowInsecure !== void 0) node["skip-cert-verify"] = allowInsecure;
    if (tlsVerification !== void 0) node["skip-cert-verify"] = !tlsVerification;
    const headers = parseHeadersParam(params.get("headers") || params.get("header") || "");
    if (headers) node.headers = headers;
  }
  if (node.type === "socks4" || node.type === "socks5") {
    if (sni) node.sni = sni;
    if (allowInsecure !== void 0) node["skip-cert-verify"] = allowInsecure;
    if (tlsVerification !== void 0) node["skip-cert-verify"] = !tlsVerification;
    const udp = parseBoolish4(params.get("udp") || params.get("udp-relay") || params.get("udp_relay"));
    if (udp !== void 0) node.udp = udp;
  }
  if (node.type === "ssh") {
    if (privateKeyRaw) node["private-key"] = privateKeyRaw;
    if (hostKeyRaw) {
      const list = hostKeyRaw.split(/[|,;]+/).map((s) => s.trim()).filter(Boolean);
      if (list.length > 0) node["host-key"] = list;
    }
    const serverFingerprint = (params.get("server-fingerprint") || params.get("server_fingerprint") || "").trim();
    const idleTimeout = (params.get("idle-timeout") || params.get("idle_timeout") || "").trim();
    const hostKeyAlgorithms = (params.get("host-key-algorithms") || params.get("host_key_algorithms") || "").trim();
    if (serverFingerprint) node["server-fingerprint"] = serverFingerprint;
    if (/^\d+$/.test(idleTimeout)) node["idle-timeout"] = Number.parseInt(idleTimeout, 10);
    if (hostKeyAlgorithms) {
      node["host-key-algorithms"] = hostKeyAlgorithms.split(/[|,;]+/).map((s) => s.trim()).filter(Boolean);
    }
    if (allowInsecure !== void 0) node["skip-cert-verify"] = allowInsecure;
  }
}
function parseStandardUrl(uri, proxyType, options2) {
  const { value: normalizedUri, name: rawSuffixName } = stripMetaSuffix(uri);
  const suffixName = rawSuffixName ? safeDecodeFormUrlEncoded(rawSuffixName) : "";
  const authority = normalizedUri.replace(/^([a-zA-Z][a-zA-Z0-9+.-]*):\/\//, "").split(/[/?#]/)[0];
  if (!authority.startsWith("[") && !authority.includes("@") && !authority.includes(":")) {
    const decoded = tryDecodeBase64Token(authority);
    if (decoded) {
      const atIndex = decoded.lastIndexOf("@");
      const authPart = atIndex === -1 ? "" : decoded.slice(0, atIndex);
      const serverPart = atIndex === -1 ? decoded : decoded.slice(atIndex + 1);
      const parsed = parseServerPort(serverPart.trim());
      const server2 = parsed.server;
      const port2 = parsed.port;
      if (server2 && port2 !== void 0) {
        const queryName = (() => {
          const qIndex2 = normalizedUri.indexOf("?");
          if (qIndex2 === -1) return "";
          const hashIndex = normalizedUri.indexOf("#", qIndex2);
          const queryString = normalizedUri.slice(qIndex2 + 1, hashIndex === -1 ? void 0 : hashIndex);
          const params = new URLSearchParams(queryString);
          const remark = params.get("remark") || params.get("remarks") || "";
          return safeDecodeFormUrlEncoded(remark);
        })();
        const hashIdx = normalizedUri.indexOf("#");
        const hashName2 = hashIdx === -1 ? "" : safeDecodeFormUrlEncoded(normalizedUri.slice(hashIdx + 1));
        const name2 = suffixName || hashName2 || queryName || `${proxyType.toUpperCase()}-${server2}:${port2}`;
        const auth = parseUserPassAuth(authPart);
        const node2 = buildNode(proxyType, {
          name: name2,
          server: server2,
          port: port2,
          username: auth.username,
          password: auth.password,
          tls: options2?.forceTls
        });
        const qIndex = normalizedUri.indexOf("?");
        if (qIndex !== -1) {
          const hashIndex = normalizedUri.indexOf("#", qIndex);
          const queryString = normalizedUri.slice(qIndex + 1, hashIndex === -1 ? void 0 : hashIndex);
          applyStandardUrlQueryParams(node2, new URLSearchParams(queryString));
        }
        return node2;
      }
    }
  }
  if (!authority.startsWith("[") && !authority.includes("@")) {
    const parts = authority.split(":");
    if (parts.length >= 4) {
      const server2 = parts[0];
      const port2 = parseInt(parts[1], 10);
      const username2 = parts[2] ? safeDecodeURIComponent(parts[2]) : void 0;
      const password2 = parts.slice(3).join(":") ? safeDecodeURIComponent(parts.slice(3).join(":")) : void 0;
      if (!server2) throw new Error("\u7F3A\u5C11\u670D\u52A1\u5668\u5730\u5740");
      if (isNaN(port2) || port2 <= 0 || port2 > 65535) throw new Error("\u65E0\u6548\u7684\u7AEF\u53E3\u53F7");
      const hashIdx = normalizedUri.indexOf("#");
      const hashName2 = hashIdx === -1 ? "" : safeDecodeFormUrlEncoded(normalizedUri.slice(hashIdx + 1));
      const name2 = suffixName || hashName2 || `${proxyType.toUpperCase()}-${server2}:${port2}`;
      return buildNode(proxyType, { name: name2, server: server2, port: port2, username: username2, password: password2, tls: options2?.forceTls });
    }
  }
  const url = parseUrlWithNeutralScheme(normalizedUri);
  const server = url.hostname;
  const port = parseInt(url.port || String(options2?.forceTls ? 443 : DEFAULT_PORTS[proxyType]), 10);
  const hashName = safeDecodeFormUrlEncoded(url.hash.slice(1));
  const name = suffixName || hashName || `${proxyType.toUpperCase()}-${server}:${port}`;
  if (!server) {
    throw new Error("\u7F3A\u5C11\u670D\u52A1\u5668\u5730\u5740");
  }
  if (isNaN(port) || port <= 0 || port > 65535) {
    throw new Error("\u65E0\u6548\u7684\u7AEF\u53E3\u53F7");
  }
  const rawUsername = url.username ? safeDecodeURIComponent(url.username) : void 0;
  const rawPassword = url.password ? safeDecodeURIComponent(url.password) : void 0;
  const decodedAuth = rawUsername && !rawPassword && (proxyType === "socks4" || proxyType === "socks5") ? tryDecodeBase64Token(rawUsername) : null;
  const authFromDecoded = decodedAuth && decodedAuth.includes(":") && !decodedAuth.includes("@") ? parseUserPassAuth(decodedAuth) : void 0;
  const username = authFromDecoded?.username ?? rawUsername;
  const password = authFromDecoded?.password ?? rawPassword;
  const node = buildNode(proxyType, { name, server, port, username, password, tls: options2?.forceTls });
  applyStandardUrlQueryParams(node, url.searchParams);
  return node;
}
function parseNakedFormat(input, defaultType) {
  const { value: remaining, name: rawName } = stripMetaSuffix(input);
  const name = rawName ? safeDecodeURIComponent(rawName) : void 0;
  let server;
  let port;
  let username;
  let password;
  if (remaining.includes("@")) {
    const atIndex = remaining.lastIndexOf("@");
    const authPart = remaining.slice(0, atIndex);
    const serverPart = remaining.slice(atIndex + 1);
    const authColonIndex = authPart.indexOf(":");
    if (authColonIndex !== -1) {
      username = authPart.slice(0, authColonIndex);
      password = authPart.slice(authColonIndex + 1);
    } else {
      username = authPart;
    }
    const parsed = parseServerPort(serverPart);
    server = parsed.server;
    port = parsed.port ?? DEFAULT_PORTS[defaultType];
  } else {
    const parts = remaining.split(":");
    if (parts.length >= 4) {
      server = parts[0];
      port = parseInt(parts[1], 10);
      username = parts[2];
      password = parts.slice(3).join(":");
    } else if (parts.length >= 2) {
      server = parts[0];
      port = parseInt(parts[1], 10);
    } else {
      throw new Error("\u65E0\u6548\u7684\u4EE3\u7406\u683C\u5F0F");
    }
  }
  if (!server) {
    throw new Error("\u7F3A\u5C11\u670D\u52A1\u5668\u5730\u5740");
  }
  if (isNaN(port) || port <= 0 || port > 65535) {
    throw new Error("\u65E0\u6548\u7684\u7AEF\u53E3\u53F7");
  }
  const finalName = name || `${defaultType.toUpperCase()}-${server}:${port}`;
  return buildNode(defaultType, { name: finalName, server, port, username, password });
}
function parseServerPort(input) {
  if (input.startsWith("[")) {
    const bracketEnd = input.indexOf("]");
    if (bracketEnd !== -1) {
      const server2 = input.slice(1, bracketEnd);
      const afterBracket = input.slice(bracketEnd + 1);
      if (afterBracket.startsWith(":")) {
        const port2 = parseInt(afterBracket.slice(1), 10);
        return { server: server2, port: isNaN(port2) ? void 0 : port2 };
      }
      return { server: server2 };
    }
  }
  const colonIndex = input.lastIndexOf(":");
  if (colonIndex === -1) {
    return { server: input };
  }
  const server = input.slice(0, colonIndex);
  const port = parseInt(input.slice(colonIndex + 1), 10);
  return { server, port: isNaN(port) ? void 0 : port };
}
function buildNode(type2, opts) {
  const { name, server, port, username, password, tls } = opts;
  if (type2 === "socks4" || type2 === "socks5") {
    const node2 = {
      name,
      type: type2,
      server,
      port,
      udp: type2 === "socks5"
    };
    if (username) node2.username = username;
    if (password) node2.password = password;
    if (tls) node2.tls = true;
    return node2;
  }
  if (type2 === "ssh") {
    const node2 = {
      name,
      type: "ssh",
      server,
      port
    };
    if (username) node2.username = username;
    if (password) node2.password = password;
    return node2;
  }
  const node = {
    name,
    type: type2,
    server,
    port,
    tls: type2 === "https"
  };
  if (username) node.username = username;
  if (password) node.password = password;
  return node;
}
function parseSocks(uri) {
  const trimmed = uri.trim();
  const schemeMatch = trimmed.match(/^([a-zA-Z][a-zA-Z0-9+.-]*):\/\//);
  const scheme = schemeMatch?.[1]?.toLowerCase() || "";
  if (scheme !== "socks5" && scheme !== "socks4" && scheme !== "socks" && scheme !== "socks5+tls") {
    throw new Error("\u65E0\u6548\u7684 SOCKS \u94FE\u63A5");
  }
  const node = parseSimpleProxy(trimmed, "socks5");
  const defaultName = `${node.type.toUpperCase()}-${node.server}:${node.port}`;
  if (node.name === defaultName) {
    return { ...node, name: `SOCKS-${node.server}:${node.port}` };
  }
  return node;
}
function parseHttp(uri) {
  return parseSimpleProxy(uri, "http");
}
function parseSsh(uri) {
  return parseSimpleProxy(uri, "ssh");
}
function isTelegramProxyKind(kind) {
  return kind === "socks" || kind === "http" || kind === "https";
}
function parseTelegramProxyLink(uri) {
  const url = new URL(uri);
  const kind = (() => {
    if (url.protocol === "tg:") {
      return url.hostname.toLowerCase();
    }
    if (url.hostname.toLowerCase() === "t.me") {
      const p = url.pathname.replace(/^\/+/, "").split("/")[0]?.toLowerCase() || "";
      return p;
    }
    return "";
  })();
  if (!isTelegramProxyKind(kind)) {
    throw new Error("\u65E0\u6548\u7684 Telegram \u4EE3\u7406\u94FE\u63A5");
  }
  const server = (url.searchParams.get("server") || "").trim();
  const portStr = (url.searchParams.get("port") || "").trim();
  const port = Number.parseInt(portStr, 10);
  if (!server) throw new Error("\u7F3A\u5C11\u670D\u52A1\u5668\u5730\u5740");
  if (!Number.isFinite(port) || port <= 0 || port > 65535) throw new Error("\u65E0\u6548\u7684\u7AEF\u53E3\u53F7");
  const username = (() => {
    const u = url.searchParams.get("user");
    return u ? safeDecodeURIComponent(u) : void 0;
  })();
  const password = (() => {
    const p = url.searchParams.get("pass");
    return p ? safeDecodeURIComponent(p) : void 0;
  })();
  const remarkRaw = url.searchParams.get("remark") || url.searchParams.get("remarks") || "";
  const name = safeDecodeFormUrlEncoded(remarkRaw) || `${kind.toUpperCase()}-${server}:${port}`;
  if (kind === "socks") {
    return buildNode("socks5", { name, server, port, username, password });
  }
  return buildNode(kind, { name, server, port, username, password });
}

// src/parser/protocols/ssr.ts
function safeDecodeSsrBase64(value) {
  const v = (value ?? "").trim();
  if (!v) return "";
  try {
    return decodeBase64(v);
  } catch {
    return safeDecodeFormUrlEncoded(safeDecodeURIComponent(v));
  }
}
function parseSsrQuery(query) {
  const out = {};
  const q = (query ?? "").trim().replace(/^\?/, "");
  if (!q) return out;
  for (const part of q.split("&")) {
    if (!part) continue;
    const eq = part.indexOf("=");
    if (eq === -1) {
      const key2 = part.trim();
      if (key2) out[key2] = "";
      continue;
    }
    const key = part.slice(0, eq).trim();
    if (!key) continue;
    out[key] = part.slice(eq + 1);
  }
  return out;
}
function parseSSR(uri) {
  if (!uri.startsWith("ssr://")) {
    throw new Error("\u65E0\u6548\u7684 SSR \u94FE\u63A5");
  }
  const content = uri.slice(6).trim();
  if (!content) {
    throw new Error("\u65E0\u6548\u7684 SSR \u94FE\u63A5");
  }
  let decoded;
  try {
    decoded = decodeBase64(content);
  } catch {
    throw new Error("\u65E0\u6CD5\u89E3\u7801 SSR \u94FE\u63A5");
  }
  const slashQueryIndex = decoded.indexOf("/?");
  const queryIndex = decoded.indexOf("?");
  const splitIndex = slashQueryIndex !== -1 ? slashQueryIndex : queryIndex;
  const main = splitIndex === -1 ? decoded : decoded.slice(0, splitIndex);
  const query = splitIndex === -1 ? "" : decoded.slice(splitIndex + (slashQueryIndex !== -1 ? 2 : 1));
  const parts = main.split(":");
  if (parts.length < 6) {
    throw new Error("\u65E0\u6548\u7684 SSR \u94FE\u63A5\u683C\u5F0F");
  }
  const passwordBase64 = parts.pop() ?? "";
  const obfs = (parts.pop() ?? "").trim();
  const cipher = (parts.pop() ?? "").trim();
  const protocol = (parts.pop() ?? "").trim();
  const portStr = (parts.pop() ?? "").trim();
  let server = parts.join(":").trim();
  if (server.startsWith("[") && server.endsWith("]")) {
    server = server.slice(1, -1);
  }
  const port = Number.parseInt(portStr, 10);
  if (!server) {
    throw new Error("\u7F3A\u5C11\u670D\u52A1\u5668\u5730\u5740");
  }
  if (!Number.isFinite(port) || port <= 0 || port > 65535) {
    throw new Error("\u65E0\u6548\u7684\u7AEF\u53E3\u53F7");
  }
  const password = safeDecodeSsrBase64(passwordBase64);
  const params = parseSsrQuery(query);
  const remarks = safeDecodeSsrBase64(params.remarks || params.remark || "");
  const name = remarks || `SSR-${server}:${port}`;
  const node = {
    name,
    type: "ssr",
    server,
    port,
    cipher: cipher || "aes-256-cfb",
    password,
    protocol: protocol || "origin",
    obfs: obfs || "plain",
    udp: true
  };
  const protoparam = safeDecodeSsrBase64(params.protoparam || params["protocol-param"] || "");
  if (protoparam) {
    node["protocol-param"] = protoparam;
  }
  const obfsparam = safeDecodeSsrBase64(params.obfsparam || params["obfs-param"] || "");
  if (obfsparam) {
    node["obfs-param"] = obfsparam;
  }
  return node;
}

// src/parser/protocols/trojan.ts
function parseBoolish5(value) {
  if (!value) return false;
  const normalized = value.trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes" || normalized === "on";
}
function parseTrojan(uri) {
  if (!uri.startsWith("trojan://")) {
    throw new Error("\u65E0\u6548\u7684 Trojan \u94FE\u63A5");
  }
  const url = parseUrlWithNeutralScheme(uri);
  const password = (() => {
    const user = safeDecodeURIComponent(url.username);
    const pass = safeDecodeURIComponent(url.password);
    return pass ? `${user}:${pass}` : user;
  })();
  const server = url.hostname;
  const port = parseInt(url.port || "443", 10);
  const name = safeDecodeFormUrlEncoded(url.hash.slice(1)) || "Trojan \u8282\u70B9";
  if (!password || !server) {
    throw new Error("Trojan \u914D\u7F6E\u7F3A\u5C11\u5FC5\u8981\u5B57\u6BB5");
  }
  if (isNaN(port) || port <= 0 || port > 65535) {
    throw new Error("\u65E0\u6548\u7684\u7AEF\u53E3\u53F7");
  }
  const params = url.searchParams;
  const typeRaw = params.get("type") || (params.get("ws") === "1" || params.get("ws") === "true" ? "ws" : "tcp");
  const type2 = typeRaw.trim().toLowerCase();
  const sni = params.get("sni") || params.get("peer") || server;
  const alpn = params.get("alpn") || "";
  const fp = (params.get("fp") || params.get("fingerprint") || params.get("client-fingerprint") || params.get("clientFingerprint") || "").trim();
  const path = params.get("path") || params.get("wspath") || params.get("ws-path") || "/";
  const host = params.get("host") || params.get("obfsParam") || params.get("obfs-host") || "";
  const serviceName = params.get("serviceName") || params.get("service_name") || params.get("service-name") || "";
  const grpcMode = params.get("mode") || "";
  const grpcAuthority = params.get("authority") || "";
  const allowInsecure = parseBoolish5(params.get("allowInsecure")) || parseBoolish5(params.get("allow_insecure")) || parseBoolish5(params.get("allow-insecure")) || parseBoolish5(params.get("insecure"));
  const isHttpUpgrade = type2 === "httpupgrade";
  const echRaw = params.get("ech");
  const node = {
    name,
    type: "trojan",
    server,
    port,
    password,
    udp: true,
    sni
  };
  if (echRaw !== null) {
    const echValue = echRaw.trim();
    node["ech-opts"] = buildMihomoEchOptsFromShareValue(echValue);
  }
  if (allowInsecure) {
    node["skip-cert-verify"] = true;
  }
  if (fp) {
    node["client-fingerprint"] = fp;
  }
  if (alpn) {
    const list = alpn.split(",").map((s) => s.trim()).filter(Boolean);
    if (list.length > 0) node.alpn = list;
  }
  switch (type2) {
    case "ws":
    case "httpupgrade":
      node.network = "ws";
      const { path: wsPath, earlyData } = splitWsPathEarlyData(path);
      node["ws-opts"] = {
        path: wsPath,
        headers: host ? { Host: host } : void 0,
        ...earlyData !== void 0 ? {
          "early-data-header-name": "Sec-WebSocket-Protocol",
          "max-early-data": earlyData
        } : {},
        ...isHttpUpgrade ? { "v2ray-http-upgrade": true, "v2ray-http-upgrade-fast-open": true } : {}
      };
      break;
    case "grpc":
      node.network = "grpc";
      node["grpc-opts"] = {
        "grpc-service-name": serviceName || path.replace(/^\//, ""),
        ...grpcMode ? { _grpcType: grpcMode } : {},
        ...grpcAuthority ? { _grpcAuthority: grpcAuthority } : {}
      };
      break;
    case "tcp":
    default:
      node.network = "tcp";
      break;
  }
  return node;
}

// src/parser/protocols/tuic.ts
function parseBoolParam(params, keys) {
  return keys.some((key) => {
    const value = params.get(key);
    return value === "1" || value === "true";
  });
}
function parseIntParam3(params, keys) {
  for (const key of keys) {
    const raw = params.get(key);
    if (!raw) continue;
    const value = Number.parseInt(raw, 10);
    if (Number.isFinite(value)) return value;
  }
  return void 0;
}
function pickParam(params, keys) {
  for (const key of keys) {
    const value = params.get(key);
    if (typeof value !== "string") continue;
    const trimmed = value.trim();
    if (trimmed) return trimmed;
  }
  return void 0;
}
function isUuidLike2(value) {
  const raw = (value ?? "").trim();
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(raw);
}
function parseTuic(uri) {
  if (!uri.startsWith("tuic://")) {
    throw new Error("\u65E0\u6548\u7684 TUIC \u94FE\u63A5");
  }
  const url = parseUrlWithNeutralScheme(uri);
  const params = url.searchParams;
  const rawUsername = safeDecodeURIComponent(url.username);
  const rawPassword = safeDecodeURIComponent(url.password);
  const server = url.hostname;
  const port = parseInt(url.port || "443", 10);
  const name = safeDecodeFormUrlEncoded(url.hash.slice(1)) || `TUIC-${server}:${port}`;
  const queryUuid = pickParam(params, ["uuid", "user", "username"]);
  const queryPassword = pickParam(params, ["password", "passwd"]);
  const uuid = rawPassword ? rawUsername : isUuidLike2(rawUsername) ? rawUsername : queryUuid;
  const password = rawPassword || queryPassword;
  const token = pickParam(params, ["token", "auth", "auth_str", "auth-str"]) || (!rawPassword && !password && rawUsername ? rawUsername : void 0);
  if (!server || !token && (!uuid || !password)) {
    throw new Error("TUIC \u914D\u7F6E\u7F3A\u5C11\u5FC5\u8981\u5B57\u6BB5");
  }
  if (isNaN(port) || port <= 0 || port > 65535) {
    throw new Error("\u65E0\u6548\u7684\u7AEF\u53E3\u53F7");
  }
  const congestionControl = pickParam(params, ["congestion_control", "congestion-control", "congestionControl"]);
  const udpRelayMode = pickParam(params, ["udp_relay_mode", "udp-relay-mode", "udpRelayMode"]);
  const alpnRaw = params.get("alpn") || "";
  const sni = params.get("sni") || params.get("peer") || void 0;
  const allowInsecure = parseBoolParam(params, [
    "allow_insecure",
    "allowInsecure",
    "allow-insecure",
    "insecure"
  ]);
  const disableSni = parseBoolParam(params, [
    "disable_sni",
    "disable-sni",
    "disableSni"
  ]);
  const fastOpen = parseBoolParam(params, [
    "fast_open",
    "fast-open",
    "fastOpen",
    "tfo"
  ]);
  const reduceRtt = parseBoolParam(params, [
    "reduce_rtt",
    "reduce-rtt",
    "reduceRtt"
  ]);
  const requestTimeout = parseIntParam3(params, [
    "request-timeout",
    "request_timeout",
    "requestTimeout"
  ]);
  const heartbeatInterval = parseIntParam3(params, [
    "heartbeat-interval",
    "heartbeat_interval",
    "heartbeatInterval"
  ]);
  const maxOpenStreams = parseIntParam3(params, [
    "max-open-streams",
    "max_open_streams",
    "maxOpenStreams"
  ]);
  const maxIdleTime = parseIntParam3(params, [
    "max-idle-time",
    "max_idle_time",
    "maxIdleTime"
  ]);
  const node = {
    name,
    type: "tuic",
    server,
    port,
    ...token ? { token } : { uuid, password }
  };
  if (sni) {
    node.sni = sni;
  }
  if (alpnRaw) {
    const alpnList = alpnRaw.split(",").map((s) => s.trim()).filter(Boolean);
    if (alpnList.length > 0) {
      node.alpn = alpnList;
    }
  }
  if (congestionControl) {
    node["congestion-controller"] = congestionControl;
  }
  if (udpRelayMode) {
    node["udp-relay-mode"] = udpRelayMode;
  }
  if (requestTimeout !== void 0) {
    node["request-timeout"] = requestTimeout;
  }
  if (heartbeatInterval !== void 0) {
    node["heartbeat-interval"] = heartbeatInterval;
  }
  if (maxOpenStreams !== void 0) {
    node["max-open-streams"] = maxOpenStreams;
  }
  if (maxIdleTime !== void 0) {
    node["max-idle-time"] = maxIdleTime;
  }
  if (reduceRtt) {
    node["reduce-rtt"] = true;
  }
  if (fastOpen) {
    node.tfo = true;
  }
  if (allowInsecure) {
    node["skip-cert-verify"] = true;
  }
  if (disableSni) {
    node["disable-sni"] = true;
  }
  return node;
}

// src/parser/protocols/vless.ts
function parseBoolish6(value) {
  if (!value) return void 0;
  const normalized = value.trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;
  return void 0;
}
function splitList(value) {
  const v = (value ?? "").trim();
  if (!v) return void 0;
  const list = v.split(",").map((s) => s.trim()).filter(Boolean);
  return list.length > 0 ? list : void 0;
}
function pickQueryValue(params, keys) {
  for (const key of keys) {
    const value = params.get(key);
    if (typeof value !== "string") continue;
    const trimmed = value.trim();
    if (trimmed) return trimmed;
  }
  return "";
}
function parseHeaderMap(raw) {
  const value = raw.trim();
  if (!value) return void 0;
  const jsonHeaders = parseJsonStringMap(value);
  if (jsonHeaders) return jsonHeaders;
  if (parseJsonObject(value)) return void 0;
  const out = {};
  for (const part of value.split("|")) {
    const idx = part.indexOf(":");
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const item = part.slice(idx + 1).trim();
    if (!key || !item) continue;
    out[key] = item;
  }
  return Object.keys(out).length > 0 ? out : void 0;
}
function parseShadowrocketXhttpObfsParam(raw) {
  const value = raw.trim();
  if (!value) return {};
  const parsed = parseJsonObject(value);
  if (!parsed) return { host: value };
  let host;
  const headers = {};
  for (const [rawKey, rawValue] of Object.entries(parsed)) {
    const key = rawKey.trim();
    if (!key || typeof rawValue !== "string") continue;
    if (key.toLowerCase() === "host") {
      const candidate = rawValue.trim();
      if (!host && candidate) host = candidate;
      continue;
    }
    headers[key] = rawValue;
  }
  return {
    ...host ? { host } : {},
    ...Object.keys(headers).length > 0 ? { headers } : {}
  };
}
function buildXhttpOptsFromQuery(params, fallbackPath, fallbackHost) {
  const path = pickQueryValue(params, ["xhttp-path", "xhttp_path", "xhttpPath", "path"]) || fallbackPath || "/";
  const obfsParam = parseShadowrocketXhttpObfsParam(params.get("obfsParam") || "");
  const host = pickQueryValue(params, ["xhttp-host", "xhttp_host", "xhttpHost", "host"]) || obfsParam.host || fallbackHost;
  const mode = pickQueryValue(params, ["xhttp-mode", "xhttp_mode", "xhttpMode", "mode"]);
  const explicitHeaders = parseHeaderMap(
    pickQueryValue(params, ["xhttp-headers", "xhttp_headers", "xhttpHeaders", "headers"])
  );
  const headers = obfsParam.headers || explicitHeaders ? { ...obfsParam.headers || {}, ...explicitHeaders || {} } : void 0;
  const noGrpcHeader = parseBoolish6(
    pickQueryValue(params, ["no-grpc-header", "no_grpc_header", "noGrpcHeader"])
  );
  const xPaddingBytes = pickQueryValue(params, ["x-padding-bytes", "x_padding_bytes", "xPaddingBytes"]);
  const scMaxEachPostBytesRaw = pickQueryValue(
    params,
    ["sc-max-each-post-bytes", "sc_max_each_post_bytes", "scMaxEachPostBytes"]
  );
  const scMaxEachPostBytes = scMaxEachPostBytesRaw ? Number.parseInt(scMaxEachPostBytesRaw, 10) : void 0;
  const reuseSettings = {};
  const reuseSettingKeys = [
    ["max-concurrency", ["max-concurrency", "max_concurrency", "maxConcurrency"]],
    ["max-connections", ["max-connections", "max_connections", "maxConnections"]],
    ["c-max-reuse-times", ["c-max-reuse-times", "c_max_reuse_times", "cMaxReuseTimes"]],
    ["h-max-request-times", ["h-max-request-times", "h_max_request_times", "hMaxRequestTimes"]],
    ["h-max-reusable-secs", ["h-max-reusable-secs", "h_max_reusable_secs", "hMaxReusableSecs"]]
  ];
  for (const [key, aliases] of reuseSettingKeys) {
    const value = pickQueryValue(params, aliases);
    if (value) reuseSettings[key] = value;
  }
  const downloadSettings = {};
  const downloadPath = pickQueryValue(params, ["download-path", "download_path", "downloadPath"]);
  if (downloadPath) downloadSettings.path = downloadPath;
  const downloadHost = pickQueryValue(params, ["download-host", "download_host", "downloadHost"]);
  if (downloadHost) downloadSettings.host = downloadHost;
  const downloadHeaders = parseHeaderMap(
    pickQueryValue(params, ["download-headers", "download_headers", "downloadHeaders"])
  );
  if (downloadHeaders) downloadSettings.headers = downloadHeaders;
  return {
    path,
    ...host ? { host } : {},
    ...mode ? { mode } : {},
    ...headers ? { headers } : {},
    ...noGrpcHeader !== void 0 ? { "no-grpc-header": noGrpcHeader } : {},
    ...xPaddingBytes ? { "x-padding-bytes": xPaddingBytes } : {},
    ...Number.isFinite(scMaxEachPostBytes) ? { "sc-max-each-post-bytes": scMaxEachPostBytes } : {},
    ...Object.keys(reuseSettings).length > 0 ? { "reuse-settings": reuseSettings } : {},
    ...Object.keys(downloadSettings).length > 0 ? { "download-settings": downloadSettings } : {}
  };
}
function isDigitString(value) {
  if (!value) return false;
  for (const char of value) {
    if (char < "0" || char > "9") return false;
  }
  return true;
}
function splitAtFirstQuery2(raw) {
  const queryIndex = raw.indexOf("?");
  if (queryIndex === -1) return null;
  return { token: raw.slice(0, queryIndex), suffix: raw.slice(queryIndex) };
}
function hasStandardVlessAuthority(raw) {
  const hashIndex = raw.indexOf("#");
  const beforeHash = hashIndex === -1 ? raw : raw.slice(0, hashIndex);
  const queryIndex = beforeHash.indexOf("?");
  let authority = queryIndex === -1 ? beforeHash : beforeHash.slice(0, queryIndex);
  if (authority.endsWith("/")) authority = authority.slice(0, -1);
  const atIndex = authority.lastIndexOf("@");
  if (atIndex <= 0) return false;
  const hostPort = authority.slice(atIndex + 1);
  if (!hostPort) return false;
  if (hostPort.startsWith("[")) {
    const bracketEnd = hostPort.indexOf("]");
    if (bracketEnd === -1) return false;
    const afterBracket = hostPort.slice(bracketEnd + 1);
    return afterBracket.startsWith(":") && isDigitString(afterBracket.slice(1));
  }
  const colonIndex = hostPort.lastIndexOf(":");
  return colonIndex > 0 && isDigitString(hostPort.slice(colonIndex + 1));
}
function stripThroughLastColon2(value) {
  const colonIndex = value.lastIndexOf(":");
  return colonIndex === -1 ? value : value.slice(colonIndex + 1);
}
function normalizeShadowrocketUri(uri) {
  const raw = uri.slice("vless://".length).trim();
  if (hasStandardVlessAuthority(raw)) {
    return { uri, isShadowrocket: false };
  }
  const parts = splitAtFirstQuery2(raw);
  if (!parts) {
    return { uri, isShadowrocket: false };
  }
  const decoded = decodeBase64(parts.token.trim());
  return { uri: `vless://${decoded}${parts.suffix}`, isShadowrocket: true };
}
function parseShadowrocketHeaderValue(raw) {
  const value = raw.trim();
  if (!value) return void 0;
  const jsonHeaders = parseJsonStringMap(value);
  if (jsonHeaders) return jsonHeaders;
  if (parseJsonObject(value)) return void 0;
  return { Host: value };
}
function parseVLESS(uri) {
  if (!uri.startsWith("vless://")) {
    throw new Error("\u65E0\u6548\u7684 VLESS \u94FE\u63A5");
  }
  const normalized = normalizeShadowrocketUri(uri);
  const url = parseUrlWithNeutralScheme(normalized.uri);
  const params = url.searchParams;
  const uuidRaw = (() => {
    const user = safeDecodeURIComponent(url.username);
    const pass = safeDecodeURIComponent(url.password);
    if (normalized.isShadowrocket) {
      return pass ? `${user}:${pass}` : user;
    }
    return user;
  })();
  const uuid = normalized.isShadowrocket ? stripThroughLastColon2(uuidRaw) : uuidRaw;
  const server = url.hostname;
  const port = parseInt(url.port || "443", 10);
  const name = safeDecodeFormUrlEncoded(url.hash.slice(1)) || safeDecodeFormUrlEncoded(params.get("remarks") || params.get("remark") || "") || "VLESS \u8282\u70B9";
  if (!uuid || !server) {
    throw new Error("VLESS \u914D\u7F6E\u7F3A\u5C11\u5FC5\u8981\u5B57\u6BB5");
  }
  if (isNaN(port) || port <= 0 || port > 65535) {
    throw new Error("\u65E0\u6548\u7684\u7AEF\u53E3\u53F7");
  }
  const headerType = (params.get("headerType") || params.get("header_type") || params.get("header-type") || "").trim().toLowerCase();
  const shadowrocketObfs = normalized.isShadowrocket ? (params.get("obfs") || "").trim().toLowerCase() : "";
  const typeInput = (params.get("type") || (parseBoolish6(params.get("h2")) ? "h2" : "") || shadowrocketObfs || "tcp").trim();
  const typeNormalized = (() => {
    const raw = typeInput.toLowerCase();
    if (raw === "none") return "tcp";
    if (raw === "websocket") return "ws";
    if (raw === "httpupgrade") return "ws";
    if (raw === "tcp" && headerType === "http") return "http";
    return raw;
  })();
  const pbk = pickQueryValue(params, ["pbk", "public-key", "public_key", "publicKey"]);
  const explicitSecurity = (params.get("security") || "").trim().toLowerCase();
  const usesImplicitShadowrocketTls = !explicitSecurity && !pbk && normalized.isShadowrocket && parseBoolish6(params.get("tls")) === true;
  const security = explicitSecurity || (pbk ? "reality" : usesImplicitShadowrocketTls ? "tls" : "none");
  const flow = (() => {
    const direct = params.get("flow") || "";
    if (direct.trim()) return direct.trim();
    if (normalized.isShadowrocket) {
      const xtls = params.get("xtls") || "";
      if (xtls === "1") return "xtls-rprx-direct";
      if (xtls === "2") return "xtls-rprx-vision";
    }
    return void 0;
  })();
  const sni = params.get("sni") || params.get("peer") || "";
  const alpn = params.get("alpn") || "";
  const clientFingerprint = pickQueryValue(params, ["fp", "fingerprint", "client-fingerprint", "clientFingerprint"]);
  const encryption = (params.get("encryption") || params.get("flow-encryption") || "").trim();
  const packetEncoding = (params.get("packet-encoding") || params.get("packet_encoding") || params.get("packetEncoding") || "").trim();
  const sid = pickQueryValue(params, ["sid", "short-id", "short_id", "shortId"]);
  const spiderX = params.get("spx") || "";
  const echRaw = params.get("ech");
  const path = params.get("path") || "/";
  const host = params.get("host") || params.get("obfsParam") || params.get("obfs-host") || "";
  const serviceName = params.get("serviceName") || params.get("service_name") || params.get("service-name") || "";
  const grpcMode = params.get("mode") || "";
  const grpcAuthority = params.get("authority") || "";
  const httpMethod = (params.get("method") || "GET").trim() || "GET";
  const tlsVerification = parseBoolish6(params.get("tls-verification"));
  const allowInsecure = parseBoolish6(params.get("allowInsecure")) === true || parseBoolish6(params.get("allow_insecure")) === true || parseBoolish6(params.get("allow-insecure")) === true || parseBoolish6(params.get("insecure")) === true || tlsVerification === false;
  const isHttpUpgrade = (params.get("type") || "").trim().toLowerCase() === "httpupgrade";
  const supportedTransports = /* @__PURE__ */ new Set(["tcp", "ws", "grpc", "h2", "http", "xhttp"]);
  if (!supportedTransports.has(typeNormalized)) {
    throw new Error(`\u4E0D\u652F\u6301\u7684 VLESS \u4F20\u8F93\u5C42: type=${typeInput || "(empty)"}\uFF08\u4EC5\u652F\u6301 tcp/ws/http/h2/grpc/xhttp\uFF09`);
  }
  const node = {
    name,
    type: "vless",
    server,
    port,
    uuid,
    udp: true,
    tls: security === "tls" || security === "reality"
  };
  if (echRaw !== null) {
    if (security !== "tls") {
      throw new Error("VLESS \u542F\u7528 ECH \u9700\u8981 security=tls\uFF08\u4E0D\u652F\u6301 Reality\uFF09");
    }
    const echValue = echRaw.trim();
    node["ech-opts"] = buildMihomoEchOptsFromShareValue(echValue);
  }
  if (allowInsecure) node["skip-cert-verify"] = true;
  const tfo = parseBoolish6(pickQueryValue(params, ["tfo", "fast-open", "fast_open", "fastOpen"]));
  if (tfo !== void 0) node.tfo = tfo;
  if (sni) node.servername = sni;
  if (flow) node.flow = flow;
  if (encryption) node.encryption = encryption;
  if (packetEncoding) node["packet-encoding"] = packetEncoding;
  if (alpn) {
    const list = splitList(alpn);
    if (list && list.length > 0) node.alpn = list;
  }
  if (clientFingerprint) node["client-fingerprint"] = clientFingerprint;
  else if (usesImplicitShadowrocketTls) node["client-fingerprint"] = "chrome";
  if (params.get("pcs")) {
    node.pcs = params.get("pcs");
  }
  if (params.get("pqv")) {
    node.pqv = params.get("pqv");
  }
  if (security === "reality") {
    const normalizedShortId = normalizeRealityShortId(sid);
    const realityOpts = {
      ...pbk ? { "public-key": pbk } : {},
      ...normalizedShortId ? { "short-id": normalizedShortId } : {},
      ...spiderX ? { "_spider-x": spiderX } : {}
    };
    if (Object.keys(realityOpts).length > 0) {
      node["reality-opts"] = realityOpts;
    }
    node["client-fingerprint"] = clientFingerprint || "chrome";
  }
  const isDomainFronting = Boolean(node.tls && sni && sni !== server);
  switch (typeNormalized) {
    case "ws": {
      node.network = "ws";
      const { path: wsPath, earlyData } = splitWsPathEarlyData(path || "/");
      const directHost = splitList(host)?.[0];
      const srHeaders = normalized.isShadowrocket && params.get("obfsParam") ? parseShadowrocketHeaderValue(params.get("obfsParam") || "") : void 0;
      const wsHeaders = srHeaders || (directHost ? { Host: directHost } : void 0);
      node["ws-opts"] = {
        path: wsPath || "/",
        headers: wsHeaders,
        ...earlyData !== void 0 ? {
          "early-data-header-name": "Sec-WebSocket-Protocol",
          "max-early-data": earlyData
        } : {},
        ...isHttpUpgrade ? { "v2ray-http-upgrade": true, "v2ray-http-upgrade-fast-open": true } : {}
      };
      break;
    }
    case "grpc":
      node.network = "grpc";
      node["grpc-opts"] = {
        "grpc-service-name": serviceName || path.replace(/^\//, ""),
        ...grpcMode ? { _grpcType: grpcMode } : {},
        ...grpcAuthority ? { _grpcAuthority: grpcAuthority } : {}
      };
      break;
    case "http": {
      node.network = "http";
      const httpHosts = splitList(host) ?? (isDomainFronting ? [sni] : void 0);
      const httpPaths = splitList(path) ?? ["/"];
      node["http-opts"] = {
        method: httpMethod.toUpperCase(),
        path: httpPaths,
        headers: httpHosts ? { Host: httpHosts } : void 0
      };
      break;
    }
    case "h2":
      node.network = "h2";
      node["h2-opts"] = {
        host: splitList(host) ?? (isDomainFronting ? [sni] : void 0),
        path: path || "/"
      };
      break;
    case "xhttp":
      node.network = "xhttp";
      node["xhttp-opts"] = buildXhttpOptsFromQuery(
        params,
        path || "/",
        params.get("obfs-host") || ""
      );
      break;
    case "tcp":
    default:
      node.network = "tcp";
      break;
  }
  return node;
}

// src/parser/protocols/vmess-utils.ts
var DINGTALK_USER_AGENT = "DingTalk/50636215 CFNetwork/3826.600.41 Darwin/24.6.0";
function hasDingTalkHost(hosts) {
  if (!hosts || hosts.length === 0) return false;
  return hosts.some((h) => /(^|\.)dingtalk\.com$/i.test(h.trim()));
}
function normalizeHttpMethod(input) {
  if (typeof input !== "string") return "GET";
  const method = input.trim();
  if (!method) return "GET";
  const upper = method.toUpperCase();
  if (!/^[A-Z][A-Z0-9-]*$/.test(upper)) return "GET";
  return upper;
}
function normalizeHeaderKey(key) {
  const k = key.trim();
  const lower = k.toLowerCase();
  if (lower === "host") return "Host";
  if (lower === "user-agent") return "User-Agent";
  if (lower === "connection") return "Connection";
  return k;
}
function parseHeaderRecord(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) return void 0;
  const record = input;
  const out = {};
  for (const [kRaw, vRaw] of Object.entries(record)) {
    const key = typeof kRaw === "string" ? normalizeHeaderKey(kRaw) : "";
    if (!key) continue;
    const values = (() => {
      if (Array.isArray(vRaw)) {
        const list = vRaw.filter((v) => typeof v === "string").map((v) => v.trim()).filter(Boolean);
        return list.length > 0 ? list : void 0;
      }
      if (typeof vRaw === "string") {
        const v = vRaw.trim();
        return v ? [v] : void 0;
      }
      if (typeof vRaw === "number" || typeof vRaw === "boolean") {
        return [String(vRaw)];
      }
      return void 0;
    })();
    if (values && values.length > 0) out[key] = values;
  }
  return Object.keys(out).length > 0 ? out : void 0;
}
function splitList2(value) {
  const raw = (value ?? "").trim();
  if (!raw) return void 0;
  const list = raw.split(",").map((item) => item.trim()).filter(Boolean);
  return list.length > 0 ? list : void 0;
}
function pickString2(value) {
  return typeof value === "string" ? value.trim() : "";
}
function parseBooleanish2(value) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number" && Number.isFinite(value)) {
    if (value === 0) return false;
    if (value === 1) return true;
    return void 0;
  }
  if (typeof value !== "string") return void 0;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return void 0;
  if (normalized === "1" || normalized === "true" || normalized === "yes" || normalized === "on") return true;
  if (normalized === "0" || normalized === "false" || normalized === "no" || normalized === "off") return false;
  return void 0;
}
function looksLikeUriStyleVmess(content) {
  return content.includes("@") || content.includes("?");
}
function looksLikeStandardVmessStyle(content) {
  return /^[a-z]+(?:\+[a-z]+)?:[^@\s]+-\d+@[^\s]+:\d+/i.test(content);
}
function looksLikeShadowrocketStyleVmess(content) {
  const queryIndex = content.indexOf("?");
  if (queryIndex <= 0) return false;
  const base = content.slice(0, queryIndex).replace(/\/$/, "");
  if (!base || base.includes("@")) return false;
  try {
    const decoded = decodeBase64(base);
    return /(^[^:]+?):([^:]+?)@(.+):(\d+)$/.test(decoded);
  } catch {
    return false;
  }
}
function stripOuterQuotes(value) {
  return value.trim().replace(/^['"]|['"]$/g, "");
}
function pickQueryParam(params, ...keys) {
  for (const key of keys) {
    const value = params.get(key);
    if (value !== null && value !== void 0 && value !== "") {
      return value;
    }
  }
  return void 0;
}
function parseObfsHeaderHost(raw) {
  if (!raw) return void 0;
  const decoded = safeDecodeFormUrlEncoded(stripOuterQuotes(raw));
  const hostMatch = decoded.match(/Host:\s*([^,;\s]+)/i);
  return hostMatch?.[1]?.trim() || decoded || void 0;
}

// src/parser/protocols/vmess.ts
function isAlphaString(value) {
  if (!value) return false;
  for (const char of value) {
    const lower = char.toLowerCase();
    if (lower < "a" || lower > "z") return false;
  }
  return true;
}
function isDigitString2(value) {
  if (!value) return false;
  for (const char of value) {
    if (char < "0" || char > "9") return false;
  }
  return true;
}
function containsWhitespace(value) {
  for (const char of value) {
    if (char.trim() === "") return true;
  }
  return false;
}
function parseStandardVmessParts(value) {
  const queryIndex = value.indexOf("?");
  const query = queryIndex === -1 ? "" : value.slice(queryIndex + 1);
  let base = queryIndex === -1 ? value : value.slice(0, queryIndex);
  if (base.endsWith("/")) base = base.slice(0, -1);
  const schemeIndex = base.indexOf(":");
  if (schemeIndex <= 0) return null;
  const networkTag = base.slice(0, schemeIndex);
  const rest = base.slice(schemeIndex + 1);
  const plusIndex = networkTag.indexOf("+");
  const networkRaw = plusIndex === -1 ? networkTag : networkTag.slice(0, plusIndex);
  const tlsTag = plusIndex === -1 ? "" : networkTag.slice(plusIndex + 1);
  if (!isAlphaString(networkRaw) || tlsTag && !isAlphaString(tlsTag)) return null;
  const atIndex = rest.indexOf("@");
  if (atIndex <= 0) return null;
  const identity = rest.slice(0, atIndex);
  const hostPort = rest.slice(atIndex + 1);
  const dashIndex = identity.lastIndexOf("-");
  if (dashIndex <= 0) return null;
  const uuid = identity.slice(0, dashIndex);
  const aid = identity.slice(dashIndex + 1);
  if (!uuid || uuid.includes("@") || containsWhitespace(uuid) || !isDigitString2(aid)) return null;
  const colonIndex = hostPort.lastIndexOf(":");
  if (colonIndex <= 0) return null;
  const server = hostPort.slice(0, colonIndex);
  const port = hostPort.slice(colonIndex + 1);
  if (!server || !isDigitString2(port)) return null;
  return { networkRaw, tlsTag, uuid, aid, server, port, query };
}
function parseKitsunebiBase(value) {
  const atIndex = value.indexOf("@");
  if (atIndex <= 0) return null;
  const uuid = value.slice(0, atIndex);
  const hostPort = value.slice(atIndex + 1);
  const colonIndex = hostPort.indexOf(":");
  if (colonIndex <= 0) return null;
  return {
    uuid,
    server: hostPort.slice(0, colonIndex),
    portWithMaybePath: hostPort.slice(colonIndex + 1)
  };
}
function parseShadowrocketStyleConfig(uri) {
  const raw = uri.slice(8).trim();
  const hashIndex = raw.indexOf("#");
  const remarksFromHash = hashIndex === -1 ? "" : safeDecodeFormUrlEncoded(raw.slice(hashIndex + 1));
  const withoutHash = hashIndex === -1 ? raw : raw.slice(0, hashIndex);
  const queryIndex = withoutHash.indexOf("?");
  if (queryIndex === -1) {
    throw new Error("\u65E0\u6548\u7684 Shadowrocket VMess \u94FE\u63A5");
  }
  const base64Line = withoutHash.slice(0, queryIndex).replace(/\/$/, "");
  const qs = withoutHash.slice(queryIndex + 1);
  const decoded = decodeBase64(base64Line);
  const match = decoded.match(/(^[^:]+?):([^:]+?)@(.+):(\d+)$/);
  if (!match) {
    throw new Error("\u65E0\u6548\u7684 Shadowrocket VMess \u57FA\u7840\u4FE1\u606F");
  }
  const [, cipher, uuid, server, port] = match;
  const params = new URLSearchParams(qs);
  const ech = params.has("ech") ? params.get("ech") || "" : void 0;
  const obfs = pickQueryParam(params, "obfs")?.toLowerCase();
  const network = obfs === "websocket" ? "ws" : pickQueryParam(params, "network", "type", "net") || "tcp";
  const tls = obfs === "wss" || parseBooleanish2(pickQueryParam(params, "tls")) === true || pickQueryParam(params, "security") === "tls";
  return {
    ps: remarksFromHash || safeDecodeFormUrlEncoded(pickQueryParam(params, "remarks", "remark") || "") || `VMess ${server}:${port}`,
    add: server,
    port,
    id: uuid,
    aid: pickQueryParam(params, "aid", "alterId", "alter_id") || "0",
    scy: cipher,
    net: network,
    host: pickQueryParam(params, "host") || pickQueryParam(params, "obfsParam") || void 0,
    path: pickQueryParam(params, "path", "wspath") || (network === "ws" ? "/" : void 0),
    tls: tls ? "tls" : void 0,
    sni: pickQueryParam(params, "sni", "peer") || void 0,
    alpn: pickQueryParam(params, "alpn") || void 0,
    fp: pickQueryParam(params, "fp", "fingerprint", "client-fingerprint", "clientFingerprint") || void 0,
    allowInsecure: pickQueryParam(params, "allowInsecure", "allow_insecure", "allow-insecure", "insecure"),
    ...ech !== void 0 ? { ech } : {}
  };
}
function parseStandardVmessStyleConfig(uri) {
  const raw = uri.slice(8).trim();
  const hashIndex = raw.indexOf("#");
  const remarks = hashIndex === -1 ? "" : safeDecodeFormUrlEncoded(raw.slice(hashIndex + 1));
  const withoutHash = hashIndex === -1 ? raw : raw.slice(0, hashIndex);
  const parsed = parseStandardVmessParts(withoutHash);
  if (!parsed) {
    throw new Error("\u65E0\u6548\u7684\u6807\u51C6 VMess \u94FE\u63A5");
  }
  const { networkRaw, tlsTag, uuid, aid, server, port, query } = parsed;
  const params = new URLSearchParams(query);
  const ech = params.has("ech") ? params.get("ech") || "" : void 0;
  const network = networkRaw.toLowerCase();
  const tls = Boolean((tlsTag || "").trim()) || parseBooleanish2(pickQueryParam(params, "tls")) === true;
  const queryHost = pickQueryParam(params, "host", "wsHost", "ws.host") || parseObfsHeaderHost(pickQueryParam(params, "obfsParam"));
  const queryPath = pickQueryParam(params, "path", "wspath", "ws-path", "serviceName", "service_name");
  return {
    ps: remarks || `${server}:${port}`,
    add: server,
    port,
    id: uuid,
    aid,
    scy: pickQueryParam(params, "scy", "cipher", "encryption") || "auto",
    net: network,
    type: network === "tcp" || network === "kcp" ? pickQueryParam(params, "type") : network === "quic" ? pickQueryParam(params, "security") : void 0,
    host: network === "quic" ? pickQueryParam(params, "type") || void 0 : queryHost || void 0,
    path: network === "quic" ? pickQueryParam(params, "key") || void 0 : queryPath || void 0,
    tls: tls ? "tls" : void 0,
    sni: pickQueryParam(params, "sni", "peer") || void 0,
    alpn: pickQueryParam(params, "alpn") || void 0,
    fp: pickQueryParam(params, "fp", "fingerprint", "client-fingerprint", "clientFingerprint") || void 0,
    allowInsecure: pickQueryParam(params, "allowInsecure", "allow_insecure", "allow-insecure", "insecure"),
    mode: pickQueryParam(params, "mode") || void 0,
    authority: pickQueryParam(params, "authority") || void 0,
    ...ech !== void 0 ? { ech } : {}
  };
}
function parseKitsunebiStyleConfig(uri) {
  const raw = uri.slice(9).trim();
  const hashIndex = raw.indexOf("#");
  const remarks = hashIndex === -1 ? "" : safeDecodeFormUrlEncoded(raw.slice(hashIndex + 1));
  const withoutHash = hashIndex === -1 ? raw : raw.slice(0, hashIndex);
  const queryIndex = withoutHash.indexOf("?");
  const addition = queryIndex === -1 ? "" : withoutHash.slice(queryIndex + 1);
  const base = queryIndex === -1 ? withoutHash : withoutHash.slice(0, queryIndex);
  const parsed = parseKitsunebiBase(base);
  if (!parsed) {
    throw new Error("\u65E0\u6548\u7684 Kitsunebi VMess \u94FE\u63A5");
  }
  const { uuid, server, portWithMaybePath } = parsed;
  let port = portWithMaybePath;
  let path = "";
  const slashIndex = portWithMaybePath.indexOf("/");
  if (slashIndex !== -1) {
    port = portWithMaybePath.slice(0, slashIndex);
    path = portWithMaybePath.slice(slashIndex);
  }
  const params = new URLSearchParams(addition);
  const ech = params.has("ech") ? params.get("ech") || "" : void 0;
  const network = pickQueryParam(params, "network", "type", "net") || "tcp";
  return {
    ps: remarks || `${server}:${port}`,
    add: server,
    port,
    id: uuid,
    aid: "0",
    scy: "auto",
    net: network,
    host: pickQueryParam(params, "ws.host", "host") || void 0,
    path: path || pickQueryParam(params, "path", "wspath") || void 0,
    tls: parseBooleanish2(pickQueryParam(params, "tls")) === true ? "tls" : void 0,
    sni: pickQueryParam(params, "sni", "peer") || void 0,
    ...ech !== void 0 ? { ech } : {}
  };
}
function parseQuantumultVmessConfig(decoded) {
  const partitions = decoded.split(",").map((part) => part.trim()).filter(Boolean);
  if (partitions.length < 5) {
    throw new Error("\u65E0\u6548\u7684 Quantumult VMess \u914D\u7F6E");
  }
  const params = /* @__PURE__ */ new Map();
  for (const part of partitions) {
    const eqIndex = part.indexOf("=");
    if (eqIndex === -1) continue;
    const key = part.slice(0, eqIndex).trim();
    const value = part.slice(eqIndex + 1).trim();
    params.set(key, value);
  }
  const name = partitions[0].split("=")[0]?.trim() || "VMess \u8282\u70B9";
  const obfs = (params.get("obfs") || "").toLowerCase();
  const obfsHeader = params.get("obfs-header") || params.get("obfs_header") || "";
  const obfsHost = parseObfsHeaderHost(obfsHeader) || params.get("obfs-host") || params.get("obfs_host") || void 0;
  const obfsPath = params.get("obfs-path") || params.get("obfs_path") || void 0;
  return {
    ps: name,
    add: partitions[1],
    port: partitions[2],
    scy: partitions[3] || "auto",
    id: stripOuterQuotes(partitions[4]),
    aid: params.get("aid") || params.get("alterId") || params.get("alter_id") || "0",
    net: obfs === "ws" || obfs === "wss" ? "ws" : obfs === "http" ? "http" : "tcp",
    host: obfsHost,
    path: obfsPath ? safeDecodeFormUrlEncoded(stripOuterQuotes(obfsPath)) : void 0,
    tls: obfs === "wss" ? "tls" : void 0,
    allowInsecure: params.get("allowInsecure") || params.get("allow_insecure") || (params.get("tls-verification") === "false" ? "true" : void 0)
  };
}
function parseUriStyleConfig(uri) {
  const url = parseUrlWithNeutralScheme(uri);
  const params = url.searchParams;
  const ech = params.has("ech") ? params.get("ech") || "" : void 0;
  const networkRaw = pickString2(params.get("type") || params.get("net")).toLowerCase() || "tcp";
  const network = networkRaw === "none" ? "tcp" : networkRaw;
  const headerType = pickString2(
    params.get("headerType") || params.get("header_type") || params.get("header-type")
  ).toLowerCase();
  const security = pickString2(params.get("security")).toLowerCase();
  const tls = security === "tls" || security === "reality" || parseBooleanish2(params.get("tls")) === true;
  const allowInsecureRaw = params.get("allowInsecure") || params.get("allow_insecure") || params.get("allow-insecure") || params.get("insecure");
  const serviceName = params.get("serviceName") || params.get("service_name") || params.get("service-name") || "";
  const path = params.get("path") || "/";
  const remark = params.get("remark") || params.get("remarks") || "";
  return {
    ps: safeDecodeFormUrlEncoded(url.hash.slice(1)) || safeDecodeFormUrlEncoded(remark) || "VMess \u8282\u70B9",
    add: url.hostname,
    port: url.port || (tls ? "443" : "80"),
    id: safeDecodeURIComponent(url.username) || pickString2(params.get("id")),
    aid: params.get("aid") || params.get("alterId") || params.get("alter_id") || "0",
    scy: params.get("encryption") || params.get("scy") || params.get("cipher") || "auto",
    net: headerType === "http" ? "tcp" : network,
    type: headerType === "http" ? "http" : void 0,
    host: params.get("host") || void 0,
    edge: params.get("edge") || void 0,
    path: network === "grpc" ? serviceName || path.replace(/^\//, "") : path,
    method: params.get("method") || void 0,
    tls: tls ? "tls" : void 0,
    sni: params.get("sni") || params.get("peer") || void 0,
    alpn: params.get("alpn") || void 0,
    fp: params.get("fp") || params.get("fingerprint") || params.get("client-fingerprint") || params.get("clientFingerprint") || void 0,
    allowInsecure: allowInsecureRaw || void 0,
    serviceName: serviceName || void 0,
    packetEncoding: params.get("packet-encoding") || params.get("packet_encoding") || params.get("packetEncoding") || void 0,
    authenticatedLength: params.get("authenticated-length") || params.get("authenticated_length") || params.get("authenticatedLength") || void 0,
    globalPadding: params.get("global-padding") || params.get("global_padding") || params.get("globalPadding") || void 0,
    ...ech !== void 0 ? { ech } : {}
  };
}
function normalizeVmessTransport(rawNet) {
  const raw = (rawNet || "tcp").trim().toLowerCase() || "tcp";
  const normalized = raw === "none" ? "tcp" : raw === "websocket" ? "ws" : raw;
  if (normalized === "httpupgrade") {
    return { transport: "ws", isHttpUpgrade: true };
  }
  const supported = /* @__PURE__ */ new Set(["tcp", "ws", "grpc", "h2", "http"]);
  if (!supported.has(normalized)) {
    throw new Error(`\u4E0D\u652F\u6301\u7684 VMess \u4F20\u8F93\u5C42: net=${rawNet || "(empty)"}\uFF08\u4EC5\u652F\u6301 tcp/ws/http/h2/grpc/httpupgrade\uFF09`);
  }
  return { transport: normalized, isHttpUpgrade: false };
}
function buildNodeFromConfig(config) {
  const configRecord = config;
  const name = config.ps || "VMess \u8282\u70B9";
  const server = config.add;
  const port = parseInt(String(config.port), 10);
  const uuid = config.id;
  const alterId = parseInt(String(config.aid || 0), 10);
  const cipher = config.scy || config.encryption || "auto";
  const rawNetworkInput = pickString2(config.net || "tcp") || "tcp";
  const { transport: transportRaw, isHttpUpgrade } = normalizeVmessTransport(rawNetworkInput);
  const tls = config.tls === "tls";
  const sni = config.sni || (config.host ? config.host.split(",")[0].trim() : "") || "";
  const isDomainFronting = Boolean(tls && sni && sni !== server);
  if (!server || !port || !uuid) {
    throw new Error("VMess \u914D\u7F6E\u7F3A\u5C11\u5FC5\u8981\u5B57\u6BB5");
  }
  if (isNaN(port) || port <= 0 || port > 65535) {
    throw new Error("\u65E0\u6548\u7684\u7AEF\u53E3\u53F7");
  }
  const node = {
    name,
    type: "vmess",
    server,
    port,
    uuid,
    alterId,
    cipher,
    udp: true,
    tls
  };
  if (sni) {
    node.servername = sni;
  }
  const packetEncoding = pickString2(configRecord["packet-encoding"]) || pickString2(configRecord.packetEncoding);
  if (packetEncoding) {
    node["packet-encoding"] = packetEncoding;
  }
  const authenticatedLength = parseBooleanish2(
    configRecord["authenticated-length"] ?? configRecord.authenticatedLength
  );
  if (authenticatedLength !== void 0) {
    node["authenticated-length"] = authenticatedLength;
  }
  const globalPadding = parseBooleanish2(
    configRecord["global-padding"] ?? configRecord.globalPadding
  );
  if (globalPadding !== void 0) {
    node["global-padding"] = globalPadding;
  }
  const fp = typeof config.fp === "string" ? config.fp.trim() : "";
  if (fp) {
    node["client-fingerprint"] = fp;
  }
  if (config.alpn) {
    const list = config.alpn.split(",").map((s) => s.trim()).filter(Boolean);
    if (list.length > 0) node.alpn = list;
  }
  const allowInsecure = parseBooleanish2(config.allowInsecure);
  if (allowInsecure) {
    node["skip-cert-verify"] = true;
  }
  const echPresent = Object.prototype.hasOwnProperty.call(configRecord, "ech");
  if (echPresent) {
    if (!tls) {
      throw new Error("VMess \u542F\u7528 ECH \u9700\u8981 TLS\uFF08security=tls\uFF09");
    }
    const echValue = pickString2(configRecord.ech);
    node["ech-opts"] = buildMihomoEchOptsFromShareValue(echValue);
  }
  const httpHosts = splitList2(config.host) ?? (isDomainFronting ? [sni] : void 0);
  const httpPaths = splitList2(config.path) ?? ["/"];
  const isHttpObfs = transportRaw === "tcp" && config.type === "http";
  const ua = hasDingTalkHost(httpHosts) ? DINGTALK_USER_AGENT : void 0;
  const edge = (config.edge ?? "").trim();
  const httpMethod = normalizeHttpMethod(configRecord.method ?? config.method);
  const httpHeadersFromConfig = parseHeaderRecord(configRecord.headers ?? config.headers);
  const grpcServiceName = pickString2(configRecord.serviceName) || config.path || "";
  const grpcMode = pickString2(configRecord.mode ?? config.mode);
  const grpcAuthority = pickString2(configRecord.authority ?? config.authority);
  const transport = isHttpObfs ? "http" : transportRaw;
  switch (transport) {
    case "ws": {
      node.network = "ws";
      const { path: wsPath, earlyData } = splitWsPathEarlyData(config.path || "/");
      const wsHost = splitList2(config.host)?.[0];
      const wsHeaders = wsHost || ua || edge ? {
        ...wsHost ? { Host: wsHost } : {},
        ...edge ? { Edge: edge } : {},
        ...ua ? { "User-Agent": ua } : {}
      } : void 0;
      if (wsPath !== "/" || wsHeaders || earlyData !== void 0) {
        node["ws-opts"] = {
          path: wsPath,
          headers: wsHeaders,
          ...earlyData !== void 0 ? {
            "early-data-header-name": "Sec-WebSocket-Protocol",
            "max-early-data": earlyData
          } : {},
          ...isHttpUpgrade ? { "v2ray-http-upgrade": true, "v2ray-http-upgrade-fast-open": true } : {}
        };
      }
      break;
    }
    case "h2":
      node.network = "h2";
      node["h2-opts"] = {
        host: splitList2(config.host),
        path: config.path || "/"
      };
      break;
    case "grpc":
      node.network = "grpc";
      node["grpc-opts"] = {
        "grpc-service-name": grpcServiceName,
        ...grpcMode ? { _grpcType: grpcMode } : {},
        ...grpcAuthority ? { _grpcAuthority: grpcAuthority } : {}
      };
      break;
    case "http": {
      node.network = "http";
      const mergedHeaders = (() => {
        const base = httpHeadersFromConfig ? { ...httpHeadersFromConfig } : void 0;
        const out = base ?? {};
        if (httpHosts && !("Host" in out)) out.Host = httpHosts;
        if (edge && !("Edge" in out)) out.Edge = [edge];
        if (ua && !("User-Agent" in out)) out["User-Agent"] = [ua];
        return Object.keys(out).length > 0 ? out : void 0;
      })();
      node["http-opts"] = {
        method: httpMethod,
        path: httpPaths,
        ...mergedHeaders ? { headers: mergedHeaders } : {}
      };
      break;
    }
    case "tcp":
    default:
      node.network = "tcp";
      break;
  }
  return node;
}
function parseVMess(uri) {
  if (!uri.startsWith("vmess://") && !uri.startsWith("vmess1://")) {
    throw new Error("\u65E0\u6548\u7684 VMess \u94FE\u63A5");
  }
  if (uri.startsWith("vmess1://")) {
    return buildNodeFromConfig(parseKitsunebiStyleConfig(uri));
  }
  const content = uri.slice(8).trim();
  if (looksLikeStandardVmessStyle(content)) {
    return buildNodeFromConfig(parseStandardVmessStyleConfig(uri));
  }
  if (looksLikeShadowrocketStyleVmess(content)) {
    return buildNodeFromConfig(parseShadowrocketStyleConfig(uri));
  }
  if (looksLikeUriStyleVmess(content)) {
    return buildNodeFromConfig(parseUriStyleConfig(uri));
  }
  const hashIndex = content.indexOf("#");
  const contentWithoutHash = hashIndex === -1 ? content : content.slice(0, hashIndex);
  const remarksFromHash = hashIndex === -1 ? "" : safeDecodeFormUrlEncoded(content.slice(hashIndex + 1));
  let decoded;
  try {
    decoded = decodeBase64(contentWithoutHash);
  } catch {
    throw new Error("\u65E0\u6CD5\u89E3\u7801 VMess \u94FE\u63A5");
  }
  const parsedJson = tryParseJson(decoded);
  let config;
  if (parsedJson.ok) {
    config = parsedJson.value;
  } else {
    if (/=\s*vmess/i.test(decoded)) {
      config = parseQuantumultVmessConfig(decoded);
    } else {
      throw new Error("\u65E0\u6548\u7684 VMess JSON \u683C\u5F0F");
    }
  }
  if (remarksFromHash) {
    config = { ...config, ps: remarksFromHash };
  }
  return buildNodeFromConfig(config);
}

// src/parser/protocols/wireguard.ts
function parseBoolish7(value) {
  if (!value) return void 0;
  const normalized = value.trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;
  return void 0;
}
function parseReserved2(raw) {
  const values = raw.split(",").map((item) => Number.parseInt(item.trim(), 10)).filter((item) => Number.isInteger(item));
  return values.length === 3 ? values : void 0;
}
function assignWireGuardAddress(node, raw) {
  for (const item of raw.split(",")) {
    const normalized = item.trim().replace(/\/\d+$/, "").replace(/^\[/, "").replace(/\]$/, "");
    if (!normalized) continue;
    if (normalized.includes(":")) {
      node.ipv6 = normalized;
    } else {
      node.ip = normalized;
    }
  }
}
function parseWireGuard(uri) {
  if (!uri.startsWith("wireguard://") && !uri.startsWith("wg://")) {
    throw new Error("\u65E0\u6548\u7684 WireGuard \u94FE\u63A5");
  }
  const normalizedUri = uri.replace(/^wg:\/\//, "wireguard://");
  const url = parseUrlWithNeutralScheme(normalizedUri);
  const server = url.hostname;
  const port = Number.parseInt(url.port || "51820", 10);
  const params = url.searchParams;
  const privateKey = safeDecodeURIComponent(url.username) || params.get("private-key") || params.get("private_key") || params.get("privateKey") || "";
  const name = safeDecodeFormUrlEncoded(url.hash.slice(1)) || `WireGuard ${server}:${port}`;
  if (!server || !privateKey) {
    throw new Error("WireGuard \u914D\u7F6E\u7F3A\u5C11\u5FC5\u8981\u5B57\u6BB5");
  }
  if (!Number.isFinite(port) || port <= 0 || port > 65535) {
    throw new Error("\u65E0\u6548\u7684\u7AEF\u53E3\u53F7");
  }
  const node = {
    name,
    type: "wireguard",
    server,
    port,
    "private-key": privateKey,
    udp: true
  };
  for (const [rawKey, rawValue] of Array.from(params.entries())) {
    const key = rawKey.replace(/_/g, "-").trim();
    const value = safeDecodeURIComponent(rawValue);
    if (!key || !value) continue;
    if (key === "reserved") {
      const reserved = parseReserved2(value);
      if (reserved) node.reserved = reserved;
      continue;
    }
    if (key === "address" || key === "ip") {
      assignWireGuardAddress(node, value);
      continue;
    }
    if (key === "mtu") {
      const mtu = Number.parseInt(value, 10);
      if (Number.isInteger(mtu)) node.mtu = mtu;
      continue;
    }
    if (/publickey/i.test(key) || key === "peer-public-key") {
      node["public-key"] = value;
      continue;
    }
    if (key === "pre-shared-key" || key === "preshared-key" || key === "presharedkey") {
      node["pre-shared-key"] = value;
      continue;
    }
    if (/privatekey/i.test(key)) {
      node["private-key"] = value;
      continue;
    }
    if (key === "udp") {
      const udp = parseBoolish7(value);
      if (udp !== void 0) node.udp = udp;
      continue;
    }
    if (key === "flag") {
      continue;
    }
    if (!(key in node)) {
      node[key] = value;
    }
  }
  return node;
}

// src/parser/protocols/snell.ts
function parseBoolish8(value) {
  if (!value) return void 0;
  const normalized = value.trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;
  return void 0;
}
function parseSnell(uri) {
  if (!uri.startsWith("snell://")) {
    throw new Error("\u65E0\u6548\u7684 Snell \u94FE\u63A5");
  }
  const url = parseUrlWithNeutralScheme(uri);
  const params = url.searchParams;
  const psk = (() => {
    const user = safeDecodeURIComponent(url.username);
    const pass = safeDecodeURIComponent(url.password);
    if (user || pass) {
      return pass ? `${user}:${pass}` : user;
    }
    return (params.get("psk") || params.get("password") || params.get("auth") || params.get("auth_str") || params.get("auth-str") || "").trim();
  })();
  const server = url.hostname;
  const port = Number.parseInt(url.port || "443", 10);
  const name = safeDecodeFormUrlEncoded(url.hash.slice(1)) || `Snell ${server}:${port}`;
  if (!psk || !server) {
    throw new Error("Snell \u914D\u7F6E\u7F3A\u5C11\u5FC5\u8981\u5B57\u6BB5");
  }
  if (!Number.isFinite(port) || port <= 0 || port > 65535) {
    throw new Error("\u65E0\u6548\u7684\u7AEF\u53E3\u53F7");
  }
  const node = {
    name,
    type: "snell",
    server,
    port,
    psk
  };
  const version = Number.parseInt(params.get("version") || "", 10);
  if (Number.isInteger(version)) node.version = version;
  const obfs = params.get("obfs")?.trim().toLowerCase();
  if (obfs === "http" || obfs === "tls") {
    node["obfs-opts"] = {
      mode: obfs,
      ...params.get("obfs-host") ? { host: params.get("obfs-host") } : {},
      ...params.get("obfs-uri") ? { path: params.get("obfs-uri") } : {}
    };
  }
  const udp = parseBoolish8(params.get("udp-relay"));
  if (udp !== void 0) node.udp = udp;
  const reuse = parseBoolish8(params.get("reuse"));
  if (reuse !== void 0) node.reuse = reuse;
  const tfo = parseBoolish8(params.get("fast-open")) ?? parseBoolish8(params.get("tfo"));
  if (tfo !== void 0) node.tfo = tfo;
  const shadowTlsVersion = Number.parseInt(params.get("shadow-tls-version") || "", 10);
  if (Number.isInteger(shadowTlsVersion)) node["shadow-tls-version"] = shadowTlsVersion;
  if (params.get("shadow-tls-sni")) node["shadow-tls-sni"] = params.get("shadow-tls-sni");
  if (params.get("shadow-tls-password")) node["shadow-tls-password"] = params.get("shadow-tls-password");
  return node;
}

// src/parser/protocols/netch.ts
function pickString3(value) {
  return typeof value === "string" ? value.trim() : "";
}
function pickNumber2(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return null;
}
function parseBoolish9(value) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number" && Number.isFinite(value)) {
    if (value === 0) return false;
    if (value === 1) return true;
    return void 0;
  }
  if (typeof value !== "string") return void 0;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return void 0;
  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;
  return void 0;
}
function parseSemicolonParams(raw) {
  const value = raw.trim();
  if (!value) return void 0;
  const out = {};
  for (const part of value.split(";")) {
    const p = part.trim();
    if (!p) continue;
    const idx = p.indexOf("=");
    if (idx === -1) {
      out[p] = true;
      continue;
    }
    const k = p.slice(0, idx).trim();
    const v = p.slice(idx + 1).trim();
    if (!k) continue;
    out[k] = v;
  }
  return Object.keys(out).length > 0 ? out : void 0;
}
function normalizeTransport(raw) {
  const v = raw.trim().toLowerCase();
  if (!v || v === "none") return "tcp";
  if (v === "websocket") return "ws";
  return v;
}
function parseNetch(uri) {
  if (!uri.startsWith("netch://")) {
    throw new Error("\u65E0\u6548\u7684 Netch \u94FE\u63A5");
  }
  const payload = uri.slice("netch://".length).trim();
  if (!payload) {
    throw new Error("\u65E0\u6548\u7684 Netch \u94FE\u63A5");
  }
  const decoded = decodeBase64(payload);
  const json2 = parseJsonObject(decoded);
  if (!json2) {
    throw new Error("\u65E0\u6548\u7684 Netch JSON \u683C\u5F0F");
  }
  const typeRaw = pickString3(json2.Type);
  const type2 = typeRaw.toLowerCase();
  const server = pickString3(json2.Hostname);
  const port = pickNumber2(json2.Port);
  const name = pickString3(json2.Remark) || `${typeRaw || "Netch"}-${server}:${port ?? 0}`;
  if (!server || port === null || !Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("Netch \u914D\u7F6E\u7F3A\u5C11 server/port \u6216\u7AEF\u53E3\u65E0\u6548");
  }
  const udp = parseBoolish9(json2.EnableUDP);
  const tfo = parseBoolish9(json2.EnableTFO);
  const skipCertVerify = parseBoolish9(json2.AllowInsecure);
  const common2 = {
    name,
    server,
    port,
    ...udp !== void 0 ? { udp } : {},
    ...tfo !== void 0 ? { tfo } : {},
    ...skipCertVerify ? { "skip-cert-verify": true } : {}
  };
  if (type2 === "ss") {
    const cipher = pickString3(json2.EncryptMethod) || "aes-256-gcm";
    const password = pickString3(json2.Password);
    if (!password) throw new Error("Netch SS \u7F3A\u5C11 password");
    const pluginRaw = pickString3(json2.Plugin);
    const pluginOptsRaw = pickString3(json2.PluginOption);
    const plugin = pluginRaw ? pluginRaw : void 0;
    const pluginOpts = pluginOptsRaw ? parseSemicolonParams(pluginOptsRaw) : void 0;
    return {
      ...common2,
      type: "ss",
      cipher,
      password,
      ...plugin ? { plugin } : {},
      ...pluginOpts ? { "plugin-opts": pluginOpts } : {}
    };
  }
  if (type2 === "ssr") {
    const cipher = pickString3(json2.EncryptMethod) || "aes-256-cfb";
    const password = pickString3(json2.Password);
    const protocol = pickString3(json2.Protocol) || "origin";
    const protocolParam = pickString3(json2.ProtocolParam) || void 0;
    const obfs = pickString3(json2.OBFS) || "plain";
    const obfsParam = pickString3(json2.OBFSParam) || void 0;
    if (!password) throw new Error("Netch SSR \u7F3A\u5C11 password");
    return {
      ...common2,
      type: "ssr",
      cipher,
      password,
      protocol,
      ...protocolParam ? { "protocol-param": protocolParam } : {},
      obfs,
      ...obfsParam ? { "obfs-param": obfsParam } : {}
    };
  }
  if (type2 === "vmess") {
    const uuid = pickString3(json2.UserID);
    const alterId = pickNumber2(json2.AlterID) ?? 0;
    const cipher = pickString3(json2.EncryptMethod) || "auto";
    if (!uuid) throw new Error("Netch VMess \u7F3A\u5C11 uuid");
    const net = normalizeTransport(pickString3(json2.TransferProtocol));
    const fakeType = normalizeTransport(pickString3(json2.FakeType));
    const host = pickString3(json2.Host);
    const path = pickString3(json2.Path) || "/";
    const edge = pickString3(json2.Edge);
    const tls = parseBoolish9(json2.TLSSecure) === true;
    const sni = pickString3(json2.ServerName);
    if (!["tcp", "ws", "grpc", "h2", "http"].includes(net)) {
      throw new Error(`\u4E0D\u652F\u6301\u7684 Netch VMess \u4F20\u8F93\u5C42: ${net}`);
    }
    const node = {
      ...common2,
      type: "vmess",
      uuid,
      alterId,
      cipher,
      tls,
      ...sni ? { servername: sni } : {},
      ...tls && skipCertVerify ? { "skip-cert-verify": true } : {}
    };
    if (net === "ws") {
      node.network = "ws";
      node["ws-opts"] = {
        path,
        headers: host || edge ? { ...host ? { Host: host } : {}, ...edge ? { Edge: edge } : {} } : void 0
      };
    } else if (net === "grpc") {
      node.network = "grpc";
      node["grpc-opts"] = { "grpc-service-name": path.replace(/^\//, "") };
    } else if (net === "h2") {
      node.network = "h2";
      node["h2-opts"] = { host: host ? [host] : void 0, path };
    } else if (net === "http" || net === "tcp" && fakeType === "http") {
      node.network = "http";
      node["http-opts"] = {
        method: "GET",
        path: path.split(",").map((p) => p.trim()).filter(Boolean),
        ...host ? { headers: { Host: host.split(",").map((h) => h.trim()).filter(Boolean) } } : {}
      };
    } else {
      node.network = "tcp";
    }
    return node;
  }
  if (type2 === "trojan") {
    const password = pickString3(json2.Password);
    if (!password) throw new Error("Netch Trojan \u7F3A\u5C11 password");
    const net = normalizeTransport(pickString3(json2.TransferProtocol));
    const host = pickString3(json2.Host);
    const path = pickString3(json2.Path) || "/";
    const tls = parseBoolish9(json2.TLSSecure) !== false;
    const sni = pickString3(json2.ServerName) || server;
    if (!tls) {
      throw new Error("Netch Trojan \u5FC5\u987B\u542F\u7528 TLS");
    }
    if (!["tcp", "ws", "grpc", "httpupgrade"].includes(net)) {
      throw new Error(`\u4E0D\u652F\u6301\u7684 Netch Trojan \u4F20\u8F93\u5C42: ${net}`);
    }
    const node = {
      ...common2,
      type: "trojan",
      password,
      sni,
      ...skipCertVerify ? { "skip-cert-verify": true } : {}
    };
    if (net === "ws" || net === "httpupgrade") {
      node.network = "ws";
      node["ws-opts"] = {
        path,
        headers: host ? { Host: host } : void 0,
        ...net === "httpupgrade" ? { "v2ray-http-upgrade": true, "v2ray-http-upgrade-fast-open": true } : {}
      };
    } else if (net === "grpc") {
      node.network = "grpc";
      node["grpc-opts"] = { "grpc-service-name": path.replace(/^\//, "") };
    } else {
      node.network = "tcp";
    }
    return node;
  }
  if (type2 === "snell") {
    const psk = pickString3(json2.Password);
    if (!psk) throw new Error("Netch Snell \u7F3A\u5C11 psk/password");
    const obfs = pickString3(json2.OBFS).toLowerCase();
    const host = pickString3(json2.Host);
    const version = pickNumber2(json2.SnellVersion);
    const node = {
      ...common2,
      type: "snell",
      psk,
      ...version !== null && Number.isInteger(version) ? { version } : {}
    };
    if (obfs === "http" || obfs === "tls") {
      node["obfs-opts"] = {
        mode: obfs,
        ...host ? { host } : {}
      };
    }
    return node;
  }
  if (type2 === "socks5" || type2 === "socks") {
    const username = pickString3(json2.Username) || void 0;
    const password = pickString3(json2.Password) || void 0;
    return {
      ...common2,
      type: "socks5",
      ...username ? { username } : {},
      ...password ? { password } : {}
    };
  }
  if (type2 === "http" || type2 === "https") {
    const username = pickString3(json2.Username) || void 0;
    const password = pickString3(json2.Password) || void 0;
    const tls = type2 === "https";
    return {
      ...common2,
      type: type2,
      ...username ? { username } : {},
      ...password ? { password } : {},
      ...tls ? { tls: true } : {}
    };
  }
  throw new Error(`\u4E0D\u652F\u6301\u7684 Netch \u7C7B\u578B: ${typeRaw || "(empty)"}`);
}

// src/parser/link-parsers.ts
function normalizeNodeLinkScheme(input) {
  return input.replace(
    /^([a-zA-Z][a-zA-Z0-9+.-]*):\/\//,
    (_, scheme) => `${scheme.toLowerCase()}://`
  );
}
function isTelegramHttpProxyLink(link) {
  try {
    const url = new URL(link);
    const host = url.hostname.toLowerCase();
    const firstPath = url.pathname.replace(/^\/+/, "").split("/")[0]?.toLowerCase() || "";
    return host === "t.me" && (firstPath === "socks" || firstPath === "http" || firstPath === "https");
  } catch {
    return false;
  }
}
var LINK_PARSERS = [
  {
    name: "ss",
    test: (link) => link.startsWith("ss://"),
    parse: (link) => parseSS(link)
  },
  {
    name: "ssr",
    test: (link) => link.startsWith("ssr://"),
    parse: (link) => parseSSR(link)
  },
  {
    name: "netch",
    test: (link) => link.startsWith("netch://"),
    parse: (link) => parseNetch(link)
  },
  {
    name: "vmess",
    test: (link) => link.startsWith("vmess://") || link.startsWith("vmess1://"),
    parse: (link) => parseVMess(link)
  },
  {
    name: "vless",
    test: (link) => link.startsWith("vless://"),
    parse: (link) => parseVLESS(link)
  },
  {
    name: "trojan",
    test: (link) => link.startsWith("trojan://"),
    parse: (link) => parseTrojan(link)
  },
  {
    name: "anytls",
    test: (link) => link.startsWith("anytls://"),
    parse: (link) => parseAnyTLS(link)
  },
  {
    name: "hysteria",
    test: (link) => link.startsWith("hysteria://") || link.startsWith("hy://"),
    parse: (link) => parseHysteria(link)
  },
  {
    name: "hysteria2",
    test: (link) => link.startsWith("hysteria2://") || link.startsWith("hy2://"),
    parse: (link) => parseHysteria2(link)
  },
  {
    name: "tuic",
    test: (link) => link.startsWith("tuic://"),
    parse: (link) => parseTuic(link)
  },
  {
    name: "wireguard",
    test: (link) => link.startsWith("wireguard://") || link.startsWith("wg://"),
    parse: (link) => parseWireGuard(link)
  },
  {
    name: "snell",
    test: (link) => link.startsWith("snell://"),
    parse: (link) => parseSnell(link)
  },
  {
    name: "socks",
    test: (link) => link.startsWith("socks5://") || link.startsWith("socks4://") || link.startsWith("socks://") || link.startsWith("socks5+tls://"),
    parse: (link) => parseSocks(link)
  },
  {
    name: "telegram",
    test: (link) => link.startsWith("tg://"),
    parse: (link) => parseTelegramProxyLink(link)
  },
  {
    name: "http",
    test: (link) => link.startsWith("http://") || link.startsWith("https://"),
    parse: (link) => {
      if (isTelegramHttpProxyLink(link)) {
        return parseTelegramProxyLink(link);
      }
      return parseSimpleProxy(link, "http");
    }
  },
  {
    name: "ssh",
    test: (link) => link.startsWith("ssh://"),
    parse: (link) => parseSimpleProxy(link, "ssh")
  }
];
function parseNodeLinkByRegistry(link) {
  const normalizedLink = normalizeNodeLinkScheme(link.trim());
  for (const parser4 of LINK_PARSERS) {
    if (parser4.test(normalizedLink)) {
      return parser4.parse(normalizedLink);
    }
  }
  return null;
}

// src/parser/parse-node-link.ts
function isNakedProxyFormat(input) {
  if (/^[^:@]+:\d+(?:\[[^\]]*\])?(?:\{[^}]*\})?$/.test(input) && input.includes(":")) return true;
  if (/^[^:@]+:\d+:[^:@]+:.+$/.test(input)) return true;
  if (/^[^:@]+:[^@]+@[^:@]+:\d+(?:\[[^\]]*\])?(?:\{[^}]*\})?$/.test(input)) return true;
  return false;
}
function parseNodeLink(link) {
  const trimmedLink = link.trim();
  if (!trimmedLink) return null;
  const normalizedLink = normalizeNodeLinkScheme(trimmedLink);
  const parsed = parseNodeLinkByRegistry(normalizedLink);
  if (parsed) return canonicalizeParsedNode(parsed);
  if (isNakedProxyFormat(normalizedLink)) {
    throw new Error("\u65E0\u6CD5\u8BC6\u522B\u7684\u4EE3\u7406\u683C\u5F0F\uFF0C\u8BF7\u6DFB\u52A0\u534F\u8BAE\u524D\u7F00 (\u5982 socks5://, http://)");
  }
  const schemeMatch = normalizedLink.match(/^([a-zA-Z][a-zA-Z0-9+.-]*):\/\//);
  if (schemeMatch) {
    throw new Error(`\u4E0D\u652F\u6301\u7684\u534F\u8BAE: ${schemeMatch[1].toLowerCase()}`);
  }
  return null;
}

// src/parser/content-parsers.ts
function buildParseResult2(nodes, errors) {
  return {
    nodes,
    errors,
    totalParsed: nodes.length,
    totalFailed: errors.length
  };
}
function formatParseSegmentError2(segment, error) {
  const reason = error instanceof Error ? error.message : "\u672A\u77E5\u9519\u8BEF";
  return `\u89E3\u6790\u5931\u8D25: ${segment.substring(0, 50)}... - ${reason}`;
}
function splitNodeLinkSegments(content) {
  const lines = content.split(/[\r\n]+/).filter((line) => line.trim());
  const segments = [];
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith("#")) continue;
    if (!trimmedLine.includes("|")) {
      segments.push(trimmedLine);
      continue;
    }
    const candidates = trimmedLine.split("|").map((part) => part.trim()).filter(Boolean);
    if (candidates.length <= 1) {
      segments.push(trimmedLine);
      continue;
    }
    const isLinkLike = (value) => /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(value);
    if (candidates.every(isLinkLike)) {
      segments.push(...candidates);
      continue;
    }
    segments.push(trimmedLine);
  }
  return segments;
}
function hasBlockMappingSeparator(line) {
  for (let index = line.indexOf(":"); index >= 0; index = line.indexOf(":", index + 1)) {
    const next = line[index + 1];
    if (next === void 0 || next === " " || next === "	") return true;
  }
  return false;
}
function startsWithYamlNodeDocument(content) {
  for (const line of content.split(/[\r\n]+/)) {
    let trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith(";") || trimmed.startsWith("%")) continue;
    if (/^---(?:[ \t]|$)/.test(trimmed)) {
      trimmed = trimmed.slice(3).trimStart();
      if (!trimmed || trimmed.startsWith("#")) continue;
    }
    if (/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(trimmed)) return false;
    if (isPlatformConfigSectionHeader(trimmed)) {
      try {
        const root = loadSubscriptionYaml(content);
        if (!Array.isArray(root) && looksLikePlatformConfigContent(content)) return false;
      } catch {
        if (looksLikePlatformConfigContent(content)) return false;
        try {
          const header = loadSubscriptionYaml(trimmed);
          if (Array.isArray(header) && header.length === 1 && typeof header[0] === "string") return false;
        } catch {
        }
      }
    }
    return trimmed.startsWith("{") || trimmed.startsWith("[") || /^[-?](?:[ \t]|$)/.test(trimmed) || /^[!&]/.test(trimmed) || hasBlockMappingSeparator(trimmed);
  }
  return false;
}
function isClashYamlContent(content) {
  if (/^(?:[ \t]*)(?:proxies|proxy-groups|proxy-providers)[ \t]*:/m.test(content)) {
    return true;
  }
  return startsWithYamlNodeDocument(content);
}
function parseLineBasedSubscriptionContent(content) {
  const nodes = [];
  const errors = [];
  for (const segment of splitNodeLinkSegments(content)) {
    if (!segment || segment.startsWith("#")) continue;
    try {
      const node = parseNodeLink(segment);
      if (node) nodes.push(node);
    } catch (error) {
      errors.push(formatParseSegmentError2(segment, error));
    }
  }
  return buildParseResult2(nodes, errors);
}
function parseConfigLineSubscriptionContent(content) {
  const nodes = [];
  const errors = [];
  for (const rawLine of content.split(/[\r\n]+/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#") || line.startsWith(";")) continue;
    try {
      const platformNode = parsePlatformProxyLine(line);
      if (platformNode) {
        nodes.push(platformNode);
        continue;
      }
    } catch (error) {
      errors.push(formatParseSegmentError2(line, error));
      continue;
    }
    try {
      const node = parseConfigLine(line);
      if (node) nodes.push(node);
    } catch (error) {
      errors.push(formatParseSegmentError2(line, error));
    }
  }
  return buildParseResult2(nodes, errors);
}
function isConfigLineContent(content) {
  const lines = content.split(/[\r\n]+/).map((line) => line.trim()).filter((line) => line && !line.startsWith("#") && !line.startsWith(";"));
  const isLinkLike = (line) => /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(line);
  return lines.length > 0 && lines.every((line) => !isLinkLike(line) && looksLikeConfigLine(line));
}
var CONTENT_PARSERS = [
  {
    name: "clash-yaml",
    test: (content) => isClashYamlContent(content),
    parse: (content) => parseClashYaml(content)
  },
  {
    name: "platform-config",
    test: (content) => !isClashYamlContent(content) && looksLikePlatformConfigContent(content),
    parse: (content) => parsePlatformConfigContent(content)
  },
  {
    name: "config-lines",
    test: (content) => isConfigLineContent(content),
    parse: (content) => parseConfigLineSubscriptionContent(content)
  },
  {
    name: "link-lines",
    test: () => true,
    parse: (content) => parseLineBasedSubscriptionContent(content)
  }
];
function parseSubscriptionContentByRegistry(content) {
  const accumulatedErrors = [];
  for (const parser4 of CONTENT_PARSERS) {
    if (!parser4.test(content)) continue;
    try {
      const result = parser4.parse(content);
      if (parser4.name === "link-lines") {
        return buildParseResult2(result.nodes, [...accumulatedErrors, ...result.errors]);
      }
      if (result.nodes.length > 0) return result;
      accumulatedErrors.push(...result.errors);
    } catch (error) {
      if (parser4.name === "clash-yaml") {
        accumulatedErrors.push(`Clash YAML \u89E3\u6790\u5931\u8D25: ${error instanceof Error ? error.message : "\u672A\u77E5\u9519\u8BEF"}`);
        continue;
      }
      throw error;
    }
  }
  return buildParseResult2([], accumulatedErrors);
}

// src/parser/placeholder.ts
var CLIENT_UPDATE_PLACEHOLDER_ERROR = "\u68C0\u6D4B\u5230\u5BA2\u6237\u7AEF\u66F4\u65B0\u63D0\u793A\u5360\u4F4D\u8282\u70B9\uFF0C\u5DF2\u81EA\u52A8\u5FFD\u7565";
function isClientUpdatePlaceholderNode(node) {
  if (!node) return false;
  const name = typeof node.name === "string" ? node.name.trim() : "";
  const serverRaw = typeof node.server === "string" ? node.server.trim().toLowerCase().replace(/\.$/, "") : "";
  const port = typeof node.port === "number" ? node.port : Number(node.port);
  const isLoopback = serverRaw === "127.0.0.1" || serverRaw === "localhost" || serverRaw === "0.0.0.0" || serverRaw === "::1" || serverRaw === "[::1]";
  const isDummyPort = Number.isFinite(port) && port <= 1;
  const hasUpdateHint = /v2rayn|clash|版本|太旧|过旧|更新|upgrade|update/i.test(name);
  return Boolean(isLoopback && isDummyPort && hasUpdateHint);
}
function filterClientUpdatePlaceholderNodes(nodes) {
  if (!Array.isArray(nodes) || nodes.length === 0) {
    return { nodes: [], filteredCount: 0 };
  }
  const filteredNodes = nodes.filter((node) => !isClientUpdatePlaceholderNode(node));
  return {
    nodes: filteredNodes,
    filteredCount: nodes.length - filteredNodes.length
  };
}

// src/parser/normalize.ts
function mergeUniqueErrors(...parts) {
  return Array.from(
    new Set(
      parts.flatMap((items) => items).filter((item) => typeof item === "string" && item.trim()).map((item) => item.trim())
    )
  );
}
function normalizeParseErrors(errors) {
  return mergeUniqueErrors(errors);
}
function dedupeParsedNodes(nodes) {
  const seen = /* @__PURE__ */ new Set();
  const deduped = [];
  for (const node of nodes) {
    const key = isSubscriptionInfoNodeName(node.name) ? `${node.name.trim()}\0${buildNodeContentKey(node)}` : buildNodeContentKey(node);
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(node);
  }
  return {
    nodes: deduped,
    dedupedCount: nodes.length - deduped.length
  };
}
function normalizeParseResult(result, priorErrors = []) {
  const canonicalNodes = result.nodes.map((node) => canonicalizeParsedNode(node));
  const placeholderFiltered = filterClientUpdatePlaceholderNodes(canonicalNodes);
  const deduped = dedupeParsedNodes(placeholderFiltered.nodes);
  const errors = normalizeParseErrors(
    mergeUniqueErrors(
      priorErrors,
      result.errors,
      placeholderFiltered.filteredCount > 0 ? [CLIENT_UPDATE_PLACEHOLDER_ERROR] : []
    )
  );
  return {
    nodes: deduped.nodes,
    errors,
    totalParsed: deduped.nodes.length,
    totalFailed: errors.length
  };
}

// src/parser/preprocess.ts
function mergeUniqueErrors2(errors) {
  return Array.from(
    new Set(errors.filter((item) => typeof item === "string" && item.trim()).map((item) => item.trim()))
  );
}
function safeDecodeURIComponentValue(input) {
  try {
    return decodeURIComponent(input);
  } catch {
    return input;
  }
}
function looksLikeHtmlContent(content) {
  const text = content.trim();
  if (!text) return false;
  if (/^<!doctype html/i.test(text) || /^<html[\s>]/i.test(text)) return true;
  if (text.includes("<head") && text.includes("<body")) return true;
  return false;
}
function tryDecodeBase64Text(content) {
  const normalized = content.replace(/\s/g, "");
  if (!normalized || !/^[A-Za-z0-9+/=_-]+$/.test(normalized)) {
    return null;
  }
  try {
    const decoded = decodeBase64(content);
    if (!decoded || /[\x00-\x08\x0E-\x1F]/.test(decoded)) {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}
function convertSsdSubscriptionToLinks(content) {
  const raw = content.trim();
  if (!/^ssd:\/\//i.test(raw)) {
    return { error: "\u4E0D\u662F SSD \u8BA2\u9605" };
  }
  try {
    const decoded = decodeBase64(raw.slice(6));
    const parsedJson = tryParseJson(decoded);
    if (!parsedJson.ok) throw parsedJson.error;
    const parsed = parsedJson.value;
    const defaultPort = Number(parsed.port);
    const defaultMethod = typeof parsed.encryption === "string" ? parsed.encryption.trim() : "";
    const defaultPassword = typeof parsed.password === "string" ? parsed.password : "";
    const serverList = Array.isArray(parsed.servers) ? parsed.servers : parsed.servers && typeof parsed.servers === "object" ? Object.values(parsed.servers) : [];
    const links = serverList.map((entry, index) => {
      if (!entry || typeof entry !== "object") return null;
      const server = entry;
      const host = typeof server.server === "string" ? server.server.trim() : "";
      const port = Number(server.port ?? defaultPort);
      const method = typeof server.encryption === "string" ? server.encryption.trim() : defaultMethod;
      const password = typeof server.password === "string" ? server.password : defaultPassword;
      if (!host || !Number.isFinite(port) || port < 1 || port > 65535 || !method || !password) {
        return null;
      }
      const tagRaw = typeof server.remarks === "string" && server.remarks.trim() ? server.remarks.trim() : typeof parsed.airport === "string" && parsed.airport.trim() ? `${parsed.airport.trim()}-${index + 1}` : `SSD-${index + 1}`;
      const tag = safeDecodeURIComponentValue(tagRaw);
      const userInfo = encodeBase64(`${method}:${password}`);
      const pluginName = typeof server.plugin === "string" ? server.plugin.trim() : "";
      const pluginOpts = typeof server.plugin_options === "string" ? server.plugin_options.trim() : "";
      const plugin = pluginName && pluginOpts ? `/?plugin=${encodeURIComponent(`${pluginName};${pluginOpts}`)}` : pluginName ? `/?plugin=${encodeURIComponent(pluginName)}` : "";
      return `ss://${userInfo}@${host}:${port}${plugin}#${encodeURIComponent(tag)}`;
    }).filter((item) => Boolean(item));
    if (links.length === 0) {
      return { error: "SSD \u8BA2\u9605\u4E2D\u672A\u627E\u5230\u53EF\u8F6C\u6362\u7684\u670D\u52A1\u5668\u6761\u76EE" };
    }
    return { content: links.join("\n") };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "SSD \u8BA2\u9605\u89E3\u6790\u5931\u8D25" };
  }
}
function looksLikeNetchConfigContent(content) {
  const text = content.trim();
  if (!text.startsWith("{") || !text.includes("Server")) return false;
  if (text.includes("ModeFileNameType")) return true;
  if (/"Server"\s*:\s*\[/.test(text)) return true;
  return false;
}
function convertNetchConfigToLinks(content) {
  const raw = content.trim();
  if (!looksLikeNetchConfigContent(raw)) {
    return { error: "\u4E0D\u662F Netch \u914D\u7F6E" };
  }
  try {
    const parsedJson = tryParseJson(raw);
    if (!parsedJson.ok) throw parsedJson.error;
    const parsed = parsedJson.value;
    const servers = Array.isArray(parsed.Server) ? parsed.Server : null;
    if (!servers) {
      return { error: "Netch \u914D\u7F6E\u7F3A\u5C11 Server \u5217\u8868" };
    }
    const links = servers.map((entry) => {
      if (!entry) return null;
      const obj = typeof entry === "string" ? (() => {
        const decoded = tryParseJson(entry);
        return decoded.ok && decoded.value && typeof decoded.value === "object" ? decoded.value : null;
      })() : typeof entry === "object" ? entry : null;
      if (!obj) return null;
      return `netch://${encodeBase64(JSON.stringify(obj))}`;
    }).filter((item) => Boolean(item));
    if (links.length === 0) {
      return { error: "Netch \u914D\u7F6E\u4E2D\u672A\u627E\u5230\u53EF\u8F6C\u6362\u7684\u670D\u52A1\u5668\u6761\u76EE" };
    }
    return { content: links.join("\n") };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Netch \u914D\u7F6E\u89E3\u6790\u5931\u8D25" };
  }
}
function extractFullConfigProxySection(content) {
  const lines = content.split(/\r?\n/);
  const sections = [];
  let currentName = "";
  let currentLines = [];
  const flush = () => {
    if (currentName) {
      sections.push({ name: currentName, lines: [...currentLines] });
    }
    currentLines = [];
  };
  for (const rawLine of lines) {
    const match = rawLine.trim().match(/^\[(.+)\]$/);
    if (match) {
      flush();
      currentName = match[1].trim();
      continue;
    }
    if (currentName) currentLines.push(rawLine);
  }
  flush();
  const included = sections.filter((section) => /^(server_local|server_remote|proxy)$/i.test(section.name) || /^wireguard\s+/i.test(section.name));
  if (included.length === 0) {
    return { error: "\u672A\u627E\u5230\u53EF\u63D0\u53D6\u7684\u4EE3\u7406\u914D\u7F6E\u6BB5" };
  }
  const output = included.map((section) => [`[${section.name}]`, ...section.lines].join("\n").trimEnd()).join("\n\n").trim();
  if (!output) {
    return { error: "\u672A\u627E\u5230\u53EF\u63D0\u53D6\u7684\u4EE3\u7406\u914D\u7F6E\u6BB5" };
  }
  return { content: output };
}
var SUBSCRIPTION_PREPROCESSORS = [
  {
    name: "html",
    test: (content) => looksLikeHtmlContent(content),
    parse: () => ({ error: "\u68C0\u6D4B\u5230 HTML \u9875\u9762\u5185\u5BB9\uFF0C\u7591\u4F3C\u9519\u8BEF\u9875\u6216\u62E6\u622A\u9875\uFF0C\u5DF2\u505C\u6B62\u89E3\u6790" })
  },
  {
    name: "base64",
    test: (content) => Boolean(tryDecodeBase64Text(content)),
    parse: (content) => {
      const decoded = tryDecodeBase64Text(content);
      return decoded ? { content: decoded.trim() } : { error: "Base64 \u9884\u5904\u7406\u5931\u8D25" };
    }
  },
  {
    name: "ssd",
    test: (content) => /^ssd:\/\//i.test(content.trim()),
    parse: (content) => convertSsdSubscriptionToLinks(content)
  },
  {
    name: "netch-json",
    test: (content) => looksLikeNetchConfigContent(content),
    parse: (content) => convertNetchConfigToLinks(content)
  },
  {
    name: "full-config",
    test: (content) => !isClashYamlContent(content) && looksLikePlatformConfigContent(content),
    parse: (content) => extractFullConfigProxySection(content)
  }
];
function preprocessSubscriptionContent(content) {
  let current = content.trim();
  const errors = [];
  const applied = [];
  for (let pass = 0; pass < 3; pass += 1) {
    if (!current) break;
    const matched = SUBSCRIPTION_PREPROCESSORS.find((preprocessor) => preprocessor.test(current));
    if (!matched) {
      break;
    }
    const next = matched.parse(current);
    if (!next.content) {
      errors.push(
        matched.name === "ssd" ? `SSD \u8BA2\u9605\u9884\u5904\u7406\u5931\u8D25: ${next.error || "\u672A\u77E5\u9519\u8BEF"}` : next.error || `${matched.name} \u9884\u5904\u7406\u5931\u8D25`
      );
      return { content: "", errors: mergeUniqueErrors2(errors), applied };
    }
    const normalizedNext = next.content.trim();
    if (!normalizedNext || normalizedNext === current) {
      break;
    }
    current = normalizedNext;
    applied.push(matched.name);
    continue;
  }
  return {
    content: current,
    errors: mergeUniqueErrors2(errors),
    applied
  };
}

// src/parser/index.ts
function finalizeParseResult(result, priorErrors = []) {
  return normalizeParseResult(result, priorErrors);
}
function parseSubscription(content) {
  const preprocessed = preprocessSubscriptionContent(content);
  const trimmedContent = preprocessed.content.trim();
  const errors = [...preprocessed.errors];
  if (!trimmedContent) {
    return finalizeParseResult(
      {
        nodes: [],
        errors,
        totalParsed: 0,
        totalFailed: errors.length
      },
      []
    );
  }
  const result = parseSubscriptionContentByRegistry(trimmedContent);
  return finalizeParseResult(result, errors);
}

// src/api/pagination.ts
function parseClampedIntParam(value, options2) {
  const raw = value === null || value === void 0 ? "" : String(value).trim();
  const parsed = options2.parser === "number" ? Number(raw) : Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed)) return options2.fallback;
  const integer = options2.parser === "number" ? Math.trunc(parsed) : Math.floor(parsed);
  return Math.min(options2.max, Math.max(options2.min, integer));
}
function parsePagePagination(searchParams, options2) {
  const page = parseClampedIntParam(searchParams.get(options2.pageParam ?? "page"), {
    fallback: options2.defaultPage ?? 1,
    min: 1,
    max: options2.maxPage ?? 1e6,
    parser: options2.parser
  });
  const pageSize = parseClampedIntParam(searchParams.get(options2.sizeParam ?? "pageSize"), {
    fallback: options2.defaultSize,
    min: 1,
    max: options2.maxSize,
    parser: options2.parser
  });
  return {
    page,
    pageSize,
    skip: (page - 1) * pageSize
  };
}
function parseOffsetPagination(searchParams, options2) {
  return {
    take: parseClampedIntParam(searchParams.get(options2.takeParam ?? "take"), {
      fallback: options2.defaultTake,
      min: 1,
      max: options2.maxTake,
      parser: options2.parser
    }),
    skip: parseClampedIntParam(searchParams.get(options2.skipParam ?? "skip"), {
      fallback: 0,
      min: 0,
      max: options2.maxSkip,
      parser: options2.parser
    })
  };
}
function getTotalPages(total, pageSize, options2 = {}) {
  const minimum = options2.minimum ?? 0;
  if (total <= 0 || pageSize <= 0) return minimum;
  return Math.max(minimum, Math.ceil(total / pageSize));
}
export {
  BaseConfigYamlError,
  DEFAULT_BASE_CONFIG_YAML,
  DEFAULT_DNS_CONFIG,
  DEFAULT_NODE_NAME_TEMPLATE,
  DEFAULT_SUBBOOST_CONFIG,
  PROXY_GROUP_MODULES,
  TEMPLATES,
  applyDialerProxy,
  buildDefaultBaseConfigPatch,
  buildDefaultSubBoostTemplateConfig,
  buildDefaultUserConfig,
  buildNodeContentKey,
  buildScopedNodeIdentityKey,
  configToYaml,
  formatNodeNameFromTemplate,
  generateClashConfig,
  generateClashYaml,
  generateDialerProxyGroups,
  generateProxyGroups,
  generateRuleProviders,
  generateRules,
  getTemplate,
  getTemplateList,
  getTotalPages,
  normalizeSsPlugin,
  parseAnyTLS,
  parseBase64,
  parseClampedIntParam,
  parseClashYaml,
  parseHttp,
  parseHysteria,
  parseHysteria2,
  parseNodeLink,
  parseOffsetPagination,
  parsePagePagination,
  parseSS,
  parseSSR,
  parseSimpleProxy,
  parseSnell,
  parseSocks,
  parseSsh,
  parseSubscription,
  parseTelegramProxyLink,
  parseTrojan,
  parseTuic,
  parseVLESS,
  parseVMess,
  parseWireGuard,
  safeParseJson,
  safeParseJsonObject,
  stableJsonStringify,
  tryParseJson,
  validateTemplateConfig
};
