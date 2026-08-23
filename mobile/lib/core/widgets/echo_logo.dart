import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../theme/app_typography.dart';

enum LogoSize { small, medium, large, hero }

class EchoLogo extends StatelessWidget {
  final LogoSize size;
  final bool showText;
  final bool showTagline;

  const EchoLogo({
    super.key,
    this.size = LogoSize.medium,
    this.showText = true,
    this.showTagline = false,
  });

  double get _dimension {
    switch (size) {
      case LogoSize.small:
        return 28;
      case LogoSize.medium:
        return 40;
      case LogoSize.large:
        return 64;
      case LogoSize.hero:
        return 88;
    }
  }

  double get _iconSize {
    switch (size) {
      case LogoSize.small:
        return 16;
      case LogoSize.medium:
        return 22;
      case LogoSize.large:
        return 36;
      case LogoSize.hero:
        return 48;
    }
  }

  double get _borderRadius {
    switch (size) {
      case LogoSize.small:
        return 8;
      case LogoSize.medium:
        return 12;
      case LogoSize.large:
        return 18;
      case LogoSize.hero:
        return 26;
    }
  }

  @override
  Widget build(BuildContext context) {
    final iconWidget = Container(
      width: _dimension,
      height: _dimension,
      decoration: BoxDecoration(
        color: const Color(0xFF0F1B2B),
        borderRadius: BorderRadius.circular(_borderRadius),
        border: Border.all(
          color: AppColors.primary.withValues(alpha: 0.6),
          width: size == LogoSize.hero ? 2.0 : 1.5,
        ),
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withValues(alpha: 0.25),
            blurRadius: _dimension * 0.4,
            spreadRadius: 1,
          ),
        ],
      ),
      child: Center(
        child: Icon(
          Icons.graphic_eq_rounded,
          color: AppColors.primary,
          size: _iconSize,
        ),
      ),
    );

    if (!showText) return iconWidget;

    return Row(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        iconWidget,
        const SizedBox(width: 10),
        Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'EchoDesk',
              style: size == LogoSize.small
                  ? AppTypography.h3
                  : size == LogoSize.medium
                      ? AppTypography.h2
                      : AppTypography.h1,
            ),
            if (showTagline)
              Text(
                'AI Voice Agent & CRM',
                style: AppTypography.caption.copyWith(
                  color: AppColors.textSecondary,
                  fontSize: size == LogoSize.hero ? 13 : 11,
                ),
              ),
          ],
        ),
      ],
    );
  }
}
