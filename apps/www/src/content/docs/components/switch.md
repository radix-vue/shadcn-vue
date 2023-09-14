---
title: Switch
description: A control that allows the user to toggle between checked and not checked.
source: apps/www/src/lib/registry/default/ui/switch 
primitive: https://www.radix-vue.com/components/switch.html
---

<ComponentPreview name="SwitchDemo" /> 


## Installation

```bash
npx shadcn-vue@latest add switch
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
import { Switch } from '@/components/ui/switch'
</script>

<template>
  <Switch />
</template>
```