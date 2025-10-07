# 🔍 Comprehensive Multi-Viewport Audit Report

**Target**: http://localhost:3000
**Date**: 10/6/2025, 5:56:35 PM

---

## 📊 Executive Summary

- **Viewports Tested**: 4
- **Screenshots Captured**: 0
- **Z-Index Conflicts**: 0 ✅
- **Console Errors**: 0 ✅
- **Failed Network Requests**: 0 ✅
- **Interactive Tests Passed**: 1/2 ⚠️

## 📱 Viewport Analysis

### mobile - ❌ Failed

Error: page.screenshot: Timeout 30000ms exceeded.
Call log:
[2m  - taking page screenshot[22m
[2m  - waiting for fonts to load...[22m
[2m  - fonts loaded[22m


### tablet - ❌ Failed

Error: page.evaluate: SyntaxError: Failed to execute 'querySelector' on 'Document': 'div[role="banner"]:has-text("AutaMedica")' is not a valid selector.
    at checkElement (eval at evaluate (:291:30), <anonymous>:3:27)
    at eval (eval at evaluate (:291:30), <anonymous>:25:13)
    at UtilityScript.evaluate (<anonymous>:293:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44)

### desktop - ❌ Failed

Error: page.evaluate: SyntaxError: Failed to execute 'querySelector' on 'Document': 'div[role="banner"]:has-text("AutaMedica")' is not a valid selector.
    at checkElement (eval at evaluate (:291:30), <anonymous>:3:27)
    at eval (eval at evaluate (:291:30), <anonymous>:25:13)
    at UtilityScript.evaluate (<anonymous>:293:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44)

### mobile_landscape - ❌ Failed

Error: page.evaluate: SyntaxError: Failed to execute 'querySelector' on 'Document': 'div[role="banner"]:has-text("AutaMedica")' is not a valid selector.
    at checkElement (eval at evaluate (:291:30), <anonymous>:3:27)
    at eval (eval at evaluate (:291:30), <anonymous>:25:13)
    at UtilityScript.evaluate (<anonymous>:293:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44)

## 🖱️ Interactive Elements Testing

### ❌ AccountMenu Mobile

- Error: locator.isVisible: Error: strict mode violation: locator('.account-menu > div > div') resolved to 3 elements:
    1) <div class="jsx-5e92ac9edccab3e8 px-4 py-4 sm:px-6 sm:py-5 bg-[var(--au-hover)]/30 border-b-2 border-[var(--au-border)]">…</div> aka getByText('Bienvenido aAutaMedica')
    2) <div class="jsx-5e92ac9edccab3e8 p-2 sm:p-3">…</div> aka locator('div').filter({ hasText: 'Iniciar SesiónAccede a tu' }).nth(2)
    3) <div class="jsx-5e92ac9edccab3e8 px-4 py-3 sm:px-5 sm:py-4 bg-[var(--au-hover)]/20 border-t-2 border-[var(--au-border)]">…</div> aka locator('div').filter({ hasText: 'Conexión segura y cifrada' }).nth(2)

Call log:
[2m    - checking visibility of locator('.account-menu > div > div')[22m


### ✅ Carousel Navigation

- Accessibility: ✅ Has aria-label
- Screenshot: `generated-docs/comprehensive-audit/interaction_carousel_dot0.png`

## 🔍 Console & Network Monitoring

- **Console Errors**: 0
- **Console Warnings**: 0
- **Total Network Requests**: 12
- **Failed Requests**: 0

## 💡 Recommendations

### 🟡 Interactive Elements

1 interactive tests failed. Review and fix component functionality.

---

*Generated on 10/6/2025, 5:57:50 PM*
