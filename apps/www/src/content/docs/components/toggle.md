---
title: Toggle
description: A two-state button that can be either on or off.
source: apps/www/src/lib/registry/default/ui/toggle 
primitive: https://www.radix-vue.com/components/toggle.html
---

<ComponentPreview name="ToggleDemo" /> 



## Installation

```bash
npx shadcn-vue@latest add toggle
```

<ManualInstall>

1. Install `radix-vue`:

```bash
npm install radix-vue
```

2. Copy and paste the component source files linked at the top of this page into your project.
</ManualInstall>

## Usage

```vue
<script setup lang="ts">
import { Toggle } from '@/components/ui/toggle'
</script>

<template>
  <Toggle>Toggle</Toggle>
</template>
```