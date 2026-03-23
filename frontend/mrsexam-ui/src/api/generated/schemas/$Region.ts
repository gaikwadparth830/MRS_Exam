/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $Region = {
    properties: {
        regionNo: {
            type: 'number',
            isRequired: true,
            format: 'int32',
        },
        regionName: {
            type: 'string',
            isNullable: true,
            maxLength: 50,
        },
        seatRegionNo: {
            type: 'number',
            isNullable: true,
            format: 'int32',
        },
        regionNameEng: {
            type: 'string',
            isNullable: true,
            maxLength: 50,
        },
    },
} as const;
