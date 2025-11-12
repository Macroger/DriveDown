export interface IUserTableFetchDTO {
    app_user_id: string; // Auto-generated, always present after insertion
    app_user_firstname: string;
    app_user_lastname: string;
    app_user_email: string;
    app_user_created_at: Date;   // Auto-generated, always present after insertion
}

// DTO for creating a new user (excludes auto-generated fields)
export type IUserTableInsertDTO = Omit<IUserTableFetchDTO, "app_user_id" | "app_user_created_at">;