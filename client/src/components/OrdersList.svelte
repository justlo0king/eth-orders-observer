<script lang="ts">
	import { DataTable, InlineLoading, InlineNotification, Tooltip } from "carbon-components-svelte";
	import type { DataTableHeader } from "carbon-components-svelte/types/DataTable/DataTable.svelte";
  import type { OrdersData } from "../../types/services/orders/orders.class";

  export let orders: OrdersData[] = [];
  export let title: string = '';
  export let rowKeyPrefix: string = '';
  export let columns: DataTableHeader[] = [
    { key: "order_hash", value: "Hash" },
    { key: "pair", value: "Pair" },
    { key: "making_amount", value: "Making amount" },
    { key: "taking_amount", value: "Taking amount" },
    { key: "quoted_amount", value: "Quote" },
    { key: "estimated_gas_taking", value: "Gas" },
    { key: "margin", value: "Margin" },
    { key: "efficiency_with_gas", value: "Efficiency" },
    { key: "created_at", value: "Created" },
  ];
</script>

{#if title}
  <h2>{title}</h2>
{/if}

<DataTable
  headers={columns}
  rows={orders.map((order) => {
    return {
      ...order,
      id: `${rowKeyPrefix}${order.id}`,
      making_amount: Number(order.making_amount) * Math.pow(10, -1 * order.making_decimals),
      taking_amount: Number(order.taking_amount) * Math.pow(10, -1 * order.taking_decimals),
      quoted_amount: Number(order.quoted_amount) * Math.pow(10, -1 * order.taking_decimals),
      estimated_gas_taking: `${(Number(order.estimated_gas_taking) / Number(order.taking_amount) * 100).toFixed(2)}%`,
      margin: `${(Number(order.margin) / Number(order.taking_amount) * 100).toFixed(2)}%`,
      efficiency_with_gas: `${Number(order.efficiency_with_gas).toFixed(2)}%`,
      created_at: new Date(order.created_at).toLocaleTimeString(),
    }
  })}>
  <svelte:fragment slot="cell" let:row let:cell>
    {#if cell.value && (cell.key === 'order_hash' || cell.key === 'last_event')}
      <Tooltip align="start">
        <p>{cell.value}</p>
      </Tooltip>
    {:else}
      {cell.value}
    {/if}
  </svelte:fragment>
</DataTable>
{#if orders.length === 0}
  <InlineNotification
    style="margin: 1em auto;"
    lowContrast
    kind="info"
    title="Info:"
    subtitle="No content is available."
  />
{/if}
