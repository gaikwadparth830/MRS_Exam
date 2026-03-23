/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $CentreCount = {
    properties: {
        centreCountId: {
            type: 'number',
            format: 'int32',
        },
        centreNo: {
            type: 'string',
            isNullable: true,
            maxLength: 50,
        },
        centreName: {
            type: 'string',
            isNullable: true,
            maxLength: 100,
        },
        fromGroup1: {
            type: 'number',
            isNullable: true,
            format: 'int32',
        },
        toGroup1: {
            type: 'string',
            isNullable: true,
            maxLength: 50,
        },
        fromGroup2: {
            type: 'string',
            isNullable: true,
            maxLength: 50,
        },
        toGroup2: {
            type: 'string',
            isNullable: true,
            maxLength: 50,
        },
        other: {
            type: 'string',
            isNullable: true,
            maxLength: 255,
        },
        regionNo: {
            type: 'number',
            isNullable: true,
            format: 'int32',
        },
    },
} as const;
