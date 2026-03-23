/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $Center = {
    properties: {
        centreNo: {
            type: 'string',
            isRequired: true,
            maxLength: 10,
            minLength: 1,
        },
        addressTo: {
            type: 'string',
            isNullable: true,
            maxLength: 50,
        },
        centreName: {
            type: 'string',
            isNullable: true,
            maxLength: 100,
        },
        districtName: {
            type: 'string',
            isNullable: true,
            maxLength: 50,
        },
        add1: {
            type: 'string',
            isNullable: true,
            maxLength: 50,
        },
        add2: {
            type: 'string',
            isNullable: true,
            maxLength: 50,
        },
        city: {
            type: 'string',
            isNullable: true,
            maxLength: 35,
        },
        pincode: {
            type: 'string',
            isNullable: true,
            maxLength: 6,
        },
        phone: {
            type: 'string',
            isNullable: true,
            maxLength: 15,
        },
        panditFlag: {
            type: 'string',
            isNullable: true,
            maxLength: 1,
        },
        closeFlag: {
            type: 'string',
            isNullable: true,
            maxLength: 1,
        },
    },
} as const;
