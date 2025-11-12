import { getSupabase } from "./supabaseClient";

/**
 * Fetches all rows from a specified table in the database.
 *
 * @param {string} tableName - The name of the table to fetch data from.
 * @returns {Promise<T[]>} A promise that resolves to an array of rows matching the table schema.
 * @throws {Error} If the database query fails.
 */
export const fetchAllRows = async <T>(tableName: string): Promise<T[]> => {
  const supabase = getSupabase();
  const { data, error } = await supabase.from(tableName).select("*");

  if (error) {
    throw new Error(
      `Error fetching rows from table "${tableName}": ${error.message}`
    );
  }

  return data || [];
};

/**
 * Fetches a single row from a specified table by its ID.
 *
 * @param {string} tableName - The name of the table to fetch data from.
 * @param {number} id - The ID of the row to fetch.
 * @returns {Promise<IUserTableFetchDTO | null>} A promise that resolves to the row data or null if not found.
 * @throws {Error} If the database query fails.
 */
export const fetchRowById = async <T>(
  tableName: string,
  id: number
): Promise<T | null> => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from(tableName)
    .select("*")
    .eq("id", id) // Filter by the "id" column
    .single(); // Ensure only one row is returned

  if (error) throw error;
  return data;
};

/**
 * Inserts a new record into a specified table in the database.
 *
 * @param {string} tableName - The name of the table to insert data into.
 * @param {T} newData - The data to insert into the table, matching the table's schema.
 * @returns {Promise<T>} A promise that resolves to the inserted data.
 * @throws {Error} If the database insertion fails.
 * @example
 * const newUser = await addData<IUserTableDTO>("users", { name: "John Doe", age: 30 });
 */
export const addRows = async <T>(
  tableName: string,
  newData: T[]
): Promise<T[]> => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from(tableName)
    .insert(newData)
    .select();

  // Check for errors during insertion
  if (error) {
    throw new Error(
      `Error inserting data into table "${tableName}": ${error.message}`
    );
  }

  // Ensure that data was returned after insertion
  if (!data || data.length === 0) {
    throw new Error(
      `No data was returned after inserting into table "${tableName}".`
    );
  }

  // Return the inserted data
  return data;
};

/**
 * Deletes a row from a specified table by its ID.
 * @param {string} tableName - The name of the table to delete data from.
 * @param {number} id - The ID of the row to delete.
 * @returns {Promise<void>} A promise that resolves when the row is deleted.
 * @throws {Error} If the database deletion fails.
 */
export const deleteRowById = async (
  tableName: string,
  id: number
): Promise<void> => {
  const supabase = getSupabase();
  const { error } = await supabase.from(tableName).delete().eq("id", id);

  if (error) throw error;
};

/**
 * Updates a row in a specified table by its ID.
 *
 * @param {string} tableName - The name of the table to update data in.
 * @param {number} id - The ID of the row to update.
 * @param {T} updatedData - The new data to update the row with.
 * @returns {Promise<T | null>} A promise that resolves to the updated row data or null if not found.
 * @throws {Error} If the database update fails.
 */
export const updateRowById = async <T>(
  tableName: string,
  id: number,
  updatedData: T
): Promise<T | null> => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from(tableName)
    .update(updatedData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Fetches rows from a table with dynamic filters.
 *
 * @param {string} tableName - The name of the table to fetch data from.
 * @param {Record<string, any>} filters - An object representing column-value filters.
 * @returns {Promise<T[]>} A promise that resolves to an array of filtered rows.
 * @throws {Error} If the database query fails.
 */
export const fetchRowsWithFilters = async <T>(
  tableName: string,
  filters: Record<string, any>
): Promise<T[]> => {
  const supabase = getSupabase();
  let query = supabase.from(tableName).select("*");

  // Dynamically apply filters
  Object.entries(filters).forEach(([key, value]) => {
    query = query.eq(key, value);
  });

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
};

/**
 * Counts rows in a table, optionally with filters, in a type-safe way.
 *
 * @param {string} tableName - The name of the table to count rows in.
 * @param {Partial<T>} [filters] - Optional filters to apply, validated against the table schema.
 * @returns {Promise<number>} A promise that resolves to the count of rows.
 * @throws {Error} If the database query fails.
 */
export const countRows = async <T>(
  tableName: string,
  filters?: Partial<T>
): Promise<number> => {
  const supabase = getSupabase();
  let query = supabase
    .from(tableName)
    .select("*", { count: "exact", head: true });

  // Apply filters if provided
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
  }

  const { count, error } = await query;

  if (error) throw error;
  return count || 0;
};

/**
 * Fetches rows from a table with pagination. This can provide better performance for large datasets by limiting the number of pages returned.
 *
 * @param {string} tableName - The name of the table to fetch data from.
 * @param {number} page - The page number to fetch (1-based).
 * @param {number} pageSize - The number of rows per page.
 * @returns {Promise<T[]>} A promise that resolves to an array of rows for the specified page.
 * @throws {Error} If the database query fails.
 */
export const fetchPaginatedRows = async <T>(
  tableName: string,
  page: number,
  pageSize: number
): Promise<T[]> => {
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  const supabase = getSupabase();

  const { data, error } = await supabase
    .from(tableName)
    .select("*")
    .range(start, end);

  if (error) throw error;
  return data || [];
};
