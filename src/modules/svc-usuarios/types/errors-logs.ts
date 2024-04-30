export interface ErrorRecordModel {
    id?: string;
    service: string;
    description: string;
    category: string;
    createdAt?: string|Date;
    updatedAt?: string|Date;
}