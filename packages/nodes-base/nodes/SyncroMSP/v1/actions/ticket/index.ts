
import * as getAll from './getAll';
import * as add from './add';
import * as get from './get';
import * as del from './del';
import * as update from './update';

import { INodeProperties } from 'n8n-workflow';

export {
	getAll,
	add,
	get,
	del as delete,
	update,
};


export const descriptions = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		displayOptions: {
			show: {
				resource: [
					'ticket',
				],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'add',
				description: 'Add new ticket',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete ticket',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Retrieve ticket',
			},
			{
				name: 'Get All',
				value: 'getAll',
				description: 'Retrieve all tickets',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update ticket',
			},
		],
		default: 'getAll',
		description: 'The operation to perform.',
	},
	...getAll.description,
	...add.description,
	...get.description,
	...del.description,
	...update.description,
] as INodeProperties[];
