---
title: Navigation Menu
description: A collection of links for navigating websites.
source: apps/www/src/lib/registry/default/ui/navigation-menu 
primitive: https://www.radix-vue.com/components/navigation-menu.html
---

<ComponentPreview name="NavigationMenuDemo" /> 


## Installation

```bash
npx shadcn-vue@latest add navigation-menu
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
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from '@/components/ui/navigation-menu'
</script>

<template>
  <NavigationMenu>
    <NavigationMenuList>
      <NavigationMenuItem>
        <NavigationMenuTrigger>Item One</NavigationMenuTrigger>
        <NavigationMenuContent>
          <NavigationMenuLink>Link</NavigationMenuLink>
        </NavigationMenuContent>
      </NavigationMenuItem>
    </NavigationMenuList>
  </NavigationMenu>
</template>
```