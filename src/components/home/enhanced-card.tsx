import { Box, Typography, alpha, useTheme } from '@mui/material'
import React, { forwardRef, ReactNode } from 'react'

// 自定义卡片组件接口
interface EnhancedCardProps {
  title: ReactNode
  icon: ReactNode
  action?: ReactNode
  children: ReactNode
  iconColor?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success'
  minHeight?: number | string
  noContentPadding?: boolean
}

// 自定义卡片组件
export const EnhancedCard = forwardRef<HTMLElement, EnhancedCardProps>(
  (
    {
      title,
      icon,
      action,
      children,
      iconColor = 'primary',
      minHeight,
      noContentPadding = false,
    },
    ref,
  ) => {
    const theme = useTheme()
    const isDark = theme.palette.mode === 'dark'

    // 统一的标题截断样式
    const titleTruncateStyle = {
      minWidth: 0,
      maxWidth: '100%',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      display: 'block',
    }

    return (
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '12px',
          backgroundColor: isDark ? '#232530' : '#ffffff',
          border: '1px solid',
          borderColor: isDark
            ? 'rgba(255, 255, 255, 0.08)'
            : 'rgba(0, 0, 0, 0.06)',
          boxShadow: isDark
            ? '0 4px 20px -2px rgba(0, 0, 0, 0.35), 0 1px 3px rgba(0, 0, 0, 0.2)'
            : '0 2px 12px -2px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.03)',
          transition:
            'box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.25s ease',
          '&:hover': {
            boxShadow: isDark
              ? '0 8px 28px -4px rgba(0, 0, 0, 0.45)'
              : '0 6px 20px -4px rgba(0, 0, 0, 0.08)',
            borderColor: isDark
              ? 'rgba(255, 255, 255, 0.14)'
              : 'rgba(0, 0, 0, 0.1)',
          },
        }}
        ref={ref}
      >
        <Box
          sx={{
            px: 2.25,
            py: 1.25,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: 1,
            borderColor: isDark
              ? 'rgba(255, 255, 255, 0.06)'
              : 'rgba(0, 0, 0, 0.05)',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              minWidth: 0,
              flex: 1,
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '10px',
                width: 36,
                height: 36,
                mr: 1.5,
                flexShrink: 0,
                backgroundColor: alpha(theme.palette[iconColor].main, 0.12),
                color: theme.palette[iconColor].main,
              }}
            >
              {icon}
            </Box>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              {typeof title === 'string' ? (
                <Typography
                  variant="h6"
                  sx={{
                    ...titleTruncateStyle,
                    fontWeight: 600,
                    fontSize: 16,
                    letterSpacing: '-0.01em',
                  }}
                  title={title}
                >
                  {title}
                </Typography>
              ) : (
                <Box sx={titleTruncateStyle}>{title}</Box>
              )}
            </Box>
          </Box>
          {action && <Box sx={{ ml: 2, flexShrink: 0 }}>{action}</Box>}
        </Box>
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            p: noContentPadding ? 0 : 2.25,
            ...(minHeight && { minHeight }),
          }}
        >
          {children}
        </Box>
      </Box>
    )
  },
)
