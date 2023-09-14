---
title: Aspect Ratio
description: Displays content within a desired ratio.
source: apps/www/src/lib/registry/default/ui/aspect-ratio 
primitive: https://www.radix-vue.com/components/aspect-ratio.html
---


<ComponentPreview name="AspectRatioDemo" />

## Installation

```bash
npx shadcn-vue@latest add aspect-ratio
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
import { AspectRatio } from '@/components/ui/aspect-ratio'
</script>

<template>
  <div class="w-[450px]">
    <AspectRatio :ratio="16 / 9">
      <img src="https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&q=80">
    </AspectRatio>
  </div>
</template>
```