<script lang="ts">
  import "carbon-components-svelte/css/g90.css";
  import Navbar from "../components/Navbar.svelte";
  import { Grid, Row, Column } from "carbon-components-svelte";

  import { createClient } from "../modules/apiclient/api.client";
  import apiConfig from "../config/api.json";
  const apiClient = createClient({
    apiUrl: apiConfig.url
  })
</script>


<div>
  <div style="margin-bottom:84px;">
		<Navbar/>
  </div>
  <Grid>
    <Row>
      <Column>
        <slot />
      </Column>
    </Row>
  </Grid>
</div>