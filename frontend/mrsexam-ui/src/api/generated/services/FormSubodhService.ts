/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FormSubodh } from '../models/FormSubodh';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class FormSubodhService {
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static getApiFormSubodh(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/FormSubodh',
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static postApiFormSubodh({
        requestBody,
    }: {
        requestBody?: FormSubodh,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/FormSubodh',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static getApiFormSubodhPaged({
        pageNumber = 1,
        pageSize = 50,
        sessionNo,
    }: {
        pageNumber?: number,
        pageSize?: number,
        sessionNo?: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/FormSubodh/paged',
            query: {
                'pageNumber': pageNumber,
                'pageSize': pageSize,
                'sessionNo': sessionNo,
            },
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static getApiFormSubodh1({
        id,
    }: {
        id: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/FormSubodh/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static putApiFormSubodh({
        id,
        requestBody,
    }: {
        id: number,
        requestBody?: FormSubodh,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/FormSubodh/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static deleteApiFormSubodh({
        id,
    }: {
        id: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/FormSubodh/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static getApiFormSubodhUser({
        userId,
    }: {
        userId: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/FormSubodh/user/{userId}',
            path: {
                'userId': userId,
            },
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static getApiFormSubodhCentre({
        centreCode,
    }: {
        centreCode: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/FormSubodh/centre/{centreCode}',
            path: {
                'centreCode': centreCode,
            },
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static getApiFormSubodhName({
        name,
    }: {
        name: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/FormSubodh/name/{name}',
            path: {
                'name': name,
            },
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static getApiFormSubodhSession({
        sessionNo,
    }: {
        sessionNo: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/FormSubodh/session/{sessionNo}',
            path: {
                'sessionNo': sessionNo,
            },
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static getApiFormSubodhRegion({
        regionNo,
    }: {
        regionNo: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/FormSubodh/region/{regionNo}',
            path: {
                'regionNo': regionNo,
            },
        });
    }
}
