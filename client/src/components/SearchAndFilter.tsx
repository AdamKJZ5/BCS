import { useState, useEffect } from "react";

interface FilterOption {
  value: string;
  label: string;
}

interface SearchAndFilterProps {
  onSearch: (filters: any) => void;
  showFilters?: {
    search?: boolean;
    status?: boolean;
    dateRange?: boolean;
    sortBy?: boolean;
    customFilters?: Array<{
      name: string;
      label: string;
      options: FilterOption[];
    }>;
  };
  statusOptions?: FilterOption[];
  sortByOptions?: FilterOption[];
  placeholder?: string;
}

const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  onSearch,
  showFilters = {
    search: true,
    status: true,
    dateRange: true,
    sortBy: true,
  },
  statusOptions = [
    { value: "all", label: "All Status" },
    { value: "new", label: "New" },
    { value: "contacted", label: "Contacted" },
    { value: "closed", label: "Closed" },
  ],
  sortByOptions = [
    { value: "createdAt", label: "Date Created" },
    { value: "name", label: "Name" },
  ],
  placeholder = "Search...",
}) => {
  const [filters, setFilters] = useState<any>({
    search: "",
    status: "all",
    startDate: "",
    endDate: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      onSearch(filters);
    }, 500);

    return () => clearTimeout(timer);
  }, [filters]);

  const handleChange = (field: string, value: string) => {
    setFilters((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleReset = () => {
    const resetFilters = {
      search: "",
      status: "all",
      startDate: "",
      endDate: "",
      sortBy: "createdAt",
      sortOrder: "desc",
    };
    setFilters(resetFilters);
    onSearch(resetFilters);
  };

  return (
    <div style={styles.container}>
      <div style={styles.mainRow}>
        {showFilters.search && (
          <div style={styles.searchBox}>
            <input
              type="text"
              placeholder={placeholder}
              value={filters.search}
              onChange={(e) => handleChange("search", e.target.value)}
              style={styles.searchInput}
            />
            <span style={styles.searchIcon}>🔍</span>
          </div>
        )}

        {showFilters.status && (
          <select
            value={filters.status}
            onChange={(e) => handleChange("status", e.target.value)}
            style={styles.select}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}

        {showFilters.customFilters?.map((customFilter) => (
          <select
            key={customFilter.name}
            value={filters[customFilter.name] || "all"}
            onChange={(e) => handleChange(customFilter.name, e.target.value)}
            style={styles.select}
          >
            {customFilter.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ))}

        <button onClick={() => setShowAdvanced(!showAdvanced)} style={styles.advancedButton}>
          {showAdvanced ? "▲ Less Filters" : "▼ More Filters"}
        </button>

        <button onClick={handleReset} style={styles.resetButton}>
          Reset
        </button>
      </div>

      {showAdvanced && (
        <div style={styles.advancedRow}>
          {showFilters.dateRange && (
            <>
              <div style={styles.dateGroup}>
                <label style={styles.dateLabel}>Start Date:</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleChange("startDate", e.target.value)}
                  style={styles.dateInput}
                />
              </div>

              <div style={styles.dateGroup}>
                <label style={styles.dateLabel}>End Date:</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleChange("endDate", e.target.value)}
                  style={styles.dateInput}
                />
              </div>
            </>
          )}

          {showFilters.sortBy && (
            <>
              <div style={styles.sortGroup}>
                <label style={styles.dateLabel}>Sort By:</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleChange("sortBy", e.target.value)}
                  style={styles.select}
                >
                  {sortByOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.sortGroup}>
                <label style={styles.dateLabel}>Order:</label>
                <select
                  value={filters.sortOrder}
                  onChange={(e) => handleChange("sortOrder", e.target.value)}
                  style={styles.select}
                >
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: "#fff",
    padding: "1.5rem",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    marginBottom: "2rem",
  },
  mainRow: {
    display: "flex",
    gap: "1rem",
    flexWrap: "wrap" as const,
    alignItems: "center",
  },
  searchBox: {
    position: "relative" as const,
    flex: "1",
    minWidth: "250px",
  },
  searchInput: {
    width: "100%",
    padding: "0.75rem 2.5rem 0.75rem 1rem",
    border: "1px solid #ccc",
    borderRadius: "4px",
    fontSize: "1rem",
  },
  searchIcon: {
    position: "absolute" as const,
    right: "1rem",
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: "1.25rem",
    pointerEvents: "none" as const,
  },
  select: {
    padding: "0.75rem",
    border: "1px solid #ccc",
    borderRadius: "4px",
    fontSize: "1rem",
    backgroundColor: "#fff",
    cursor: "pointer",
    minWidth: "150px",
  },
  advancedButton: {
    padding: "0.75rem 1.5rem",
    backgroundColor: "#0047AB",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    fontSize: "0.95rem",
    fontWeight: "bold" as const,
    cursor: "pointer",
  },
  resetButton: {
    padding: "0.75rem 1.5rem",
    backgroundColor: "#6c757d",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    fontSize: "0.95rem",
    fontWeight: "bold" as const,
    cursor: "pointer",
  },
  advancedRow: {
    display: "flex",
    gap: "1rem",
    flexWrap: "wrap" as const,
    marginTop: "1rem",
    paddingTop: "1rem",
    borderTop: "1px solid #e0e0e0",
  },
  dateGroup: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.5rem",
  },
  sortGroup: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.5rem",
  },
  dateLabel: {
    fontSize: "0.9rem",
    fontWeight: "bold" as const,
    color: "#666",
  },
  dateInput: {
    padding: "0.75rem",
    border: "1px solid #ccc",
    borderRadius: "4px",
    fontSize: "1rem",
  },
};

export default SearchAndFilter;
