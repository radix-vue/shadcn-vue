---
title: Slider
description: An input where the user selects a value from within a given range.
source: apps/www/src/lib/registry/default/ui/slider 
primitive: https://www.radix-vue.com/components/slider.html
---

<ComponentPreview name="SliderDemo" /> 



## Installation

```bash
npx shadcn-vue@latest add slider
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
import { Slider } from '@/components/ui/slider'
</script>

<template>
  <Slider
    :default-value="[33]" :max="100" :step="1"
  />
</template>
```