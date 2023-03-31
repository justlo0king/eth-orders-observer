<script lang="ts">
  import { Tile } from 'carbon-components-svelte';
	import OrdersList from '../components/OrdersList.svelte';
	import type { OrdersData } from '../../types/services/orders/orders.class';

	import { 
		ordersStore, 
		selectedOrdersStore
	} from '../modules/orders/orders';

	let orders: OrdersData[] = [];
	ordersStore.subscribe((_orders) => {
		orders = _orders;
	});

	let selectedOrders: OrdersData[] = [];
	selectedOrdersStore.subscribe((_selectedOrders) => {
		selectedOrders = _selectedOrders;
	});
</script>

<Tile>
	<OrdersList
		rowKeyPrefix="selected_"
		title="Orders with efficiency > 0"
		orders={selectedOrders}
		columns={[
			{ key: "order_hash", value: "Hash" },
			{ key: "pair", value: "Pair" },
			{ key: "making_amount", value: "Making amount" },
			{ key: "taking_amount", value: "Taking amount" },
			{ key: "quoted_amount", value: "Quote" },
			{ key: "estimated_gas_taking", value: "Gas" },
			{ key: "last_event", value: "last_event" },
			{ key: "efficiency_with_gas", value: "Efficiency" },
      { key: "created_at", value: "Created" },
		]}
		/>
</Tile>
<br/>
<Tile>
	<OrdersList 
		rowKeyPrefix="active_"
		title="Active orders"
		{orders}
		/>
</Tile>
