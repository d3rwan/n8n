import {
	EmployeeFileProperties,
} from '../../Interfaces';

export const employeeFileDownloadDescription: EmployeeFileProperties = [
	{
		displayName: 'Employee ID',
		name: 'id',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				operation: [
					'download',
				],
				resource: [
					'employeeFile',
				],
			},
		},
		default: '',
		description: 'ID of the employee',
	},
	{
		displayName: 'File ID',
		name: 'fileId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				operation: [
					'download',
				],
				resource: [
					'employeeFile',
				],
			},
		},
		default: '',
		description: 'ID of the employee file',
	},
	{
		displayName: 'Put Output In Field',
		name: 'output',
		type: 'string',
		default: 'data',
		required: true,
		description: 'The name of the output field to put the binary file data in',
		displayOptions: {
			show: {
				operation: [
					'download',
				],
				resource: [
					'employeeFile',
				],
			},
		},
	},
];
