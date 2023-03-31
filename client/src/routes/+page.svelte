<script lang="ts">
  import { Tile } from 'carbon-components-svelte';
	import OrdersList from '../components/OrdersList.svelte';
	import type { OrdersData } from '../../types/services/orders/orders.class';

	import { 
	loadOrders,
		ordersStore, 
		selectedOrdersStore,
		selectedOrdersTotalStore
	} from '../modules/orders/orders';

	let orders: OrdersData[] = [];
	ordersStore.subscribe((_orders) => {
		orders = _orders;
	});

	let selectedOrders: OrdersData[] = [];
	selectedOrdersStore.subscribe((_selectedOrders) => {
		selectedOrders = _selectedOrders;
	});

	let selectedOrdersTotal = 0;
	selectedOrdersTotalStore.subscribe((value) => {
		selectedOrdersTotal = value;
	});
	const handlePageChange = async (event:any) => {
		const { page=0, pageSize=5 } = event.detail;

		console.log(`handlePageChange: page: ${page}, total: ${selectedOrdersTotal}`);

		const orders = await loadOrders(selectedOrdersStore, selectedOrdersTotalStore, {
			is_selected: true,
			$limit: pageSize,
			$skip: (page-1) * pageSize,
			$sort: { created_at: -1 }
		});

		console.log(`handlePageChange: orders:`, orders);
	}
</script>

<Tile>
	<OrdersList
		on:change={handlePageChange}
		rowKeyPrefix="selected_"
		title="Orders with efficiency > 0"
		orders={selectedOrders}
		pagination={true}
		totalStore={selectedOrdersTotalStore}
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
