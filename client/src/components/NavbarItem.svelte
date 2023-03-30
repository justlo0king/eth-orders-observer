<script lang="ts">
  import {
    HeaderNavItem
  } from 'carbon-components-svelte';

  export let title:string;
  export let uri:string = '#';
  export let classProps:string = '';
</script>
<HeaderNavItem href={uri} text={title} class={classProps} />
