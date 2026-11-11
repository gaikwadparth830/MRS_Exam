/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $BatchInsertRequest = {
    properties: {
        sessionNo: {
            type: 'number',
            isRequired: true,
            format: 'int32',
        },
        centreCode: {
            type: 'string',
            isNullable: true,
        },
        regionNo: {
            type: 'number',
            isRequired: true,
            format: 'int32',
        },
        startRollNo: {
            type: 'number',
            isRequired: true,
            format: 'int32',
        },
        startName: {
            type: 'string',
            isNullable: true,
        },
        endRollNo: {
            type: 'number',
            isRequired: true,
            format: 'int32',
        },
        endName: {
            type: 'string',
            isNullable: true,
        },
    },
} as const;
