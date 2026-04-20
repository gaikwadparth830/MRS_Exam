/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Paper } from '../models/Paper';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class PapersService {
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static getApiPapers(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/Papers',
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static postApiPapers({
        requestBody,
    }: {
        requestBody?: Paper,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/Papers',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static getApiPapersPaged({
        pageNumber = 1,
        pageSize = 50,
        examNo,
    }: {
        pageNumber?: number,
        pageSize?: number,
        examNo?: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/Papers/paged',
            query: {
                'pageNumber': pageNumber,
                'pageSize': pageSize,
                'examNo': examNo,
            },
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static getApiPapersExam({
        examNo,
    }: {
        examNo: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/Papers/exam/{examNo}',
            path: {
                'examNo': examNo,
            },
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static getApiPapers1({
        paperNo,
        examNo,
    }: {
        paperNo: number,
        examNo: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/Papers/{paperNo}/{examNo}',
            path: {
                'paperNo': paperNo,
                'examNo': examNo,
            },
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static putApiPapers({
        paperNo,
        examNo,
        requestBody,
    }: {
        paperNo: number,
        examNo: number,
        requestBody?: Paper,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/Papers/{paperNo}/{examNo}',
            path: {
                'paperNo': paperNo,
                'examNo': examNo,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static deleteApiPapers({
        paperNo,
        examNo,
    }: {
        paperNo: number,
        examNo: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/Papers/{paperNo}/{examNo}',
            path: {
                'paperNo': paperNo,
                'examNo': examNo,
            },
        });
    }
}
