/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $WeatherForecast = {
    properties: {
        date: {
            type: 'string',
            format: 'date',
        },
        temperatureC: {
            type: 'number',
            format: 'int32',
        },
        temperatureF: {
            type: 'number',
            isReadOnly: true,
            format: 'int32',
        },
        summary: {
            type: 'string',
            isNullable: true,
        },
    },
} as const;
