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
		title="Latest orders with efficiency > 10%"
		orders={selectedOrders}
		/>
</Tile>
<br/>
<Tile>
	<OrdersList 
		title="Active orders"
		{orders}
		/>
</Tile>
