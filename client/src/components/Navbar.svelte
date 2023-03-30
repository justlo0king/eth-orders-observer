<script lang="ts">
  import {
    Header, HeaderPanelLink, HeaderNav, HeaderNavItem, SkipToContent
  } from 'carbon-components-svelte';

  import NavbarItem from "./NavbarItem.svelte";
  const navbarItems:Record<string, string|number>[] = [
    /*
  {
    title: 'Orders',
    classProps: '',
    uri: '',
  },
    */
  ];
  let isSideNavOpen = false;
</script>


<Header company="DEV" platformName="Order inspector" bind:isSideNavOpen>
  <svelte:fragment slot="skip-to-content">
    <SkipToContent />
  </svelte:fragment>
  <HeaderNav>
    {#each navbarItems as { title, uri, classProps }, i}
      <NavbarItem title={title} uri={uri} classProps={classProps} />
    {/each}
  </HeaderNav>
</Header>
