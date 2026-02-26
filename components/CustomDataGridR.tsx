"use client";

import * as React from "react";
import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    TableSortLabel,
    Checkbox,
    Toolbar,
    Typography,
    Switch,
    FormControlLabel,
    TextField,
    IconButton,
    Stack,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

type Order = "asc" | "desc";

export interface Column<T> {
    field: keyof T;
    headerName: string;
    numeric?: boolean;
    filterable?: boolean;
}

interface CustomDataGridProps<T> {
    rows: T[];
    columns: Column<T>[];
    getRowId: (row: T) => number;
    title?: string;
    onEditRow?: (row: T) => void;
    onDeleteRow?: (row: T) => void;
}

export default function CustomDataGrid<T>({
    rows,
    columns,
    getRowId,
    title = "Tabla",
    onEditRow,
    onDeleteRow,
}: CustomDataGridProps<T>) {
    const [order, setOrder] = React.useState<Order>("asc");
    const [orderBy, setOrderBy] = React.useState<keyof T>(columns[0].field);
    const [selected, setSelected] = React.useState<number[]>([]);
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);
    const [dense, setDense] = React.useState(false);

    const [search, setSearch] = React.useState("");
    const [columnFilters, setColumnFilters] = React.useState<
        Partial<Record<keyof T, string>>
    >({});

    const handleRequestSort = (property: keyof T) => {
        const isAsc = orderBy === property && order === "asc";
        setOrder(isAsc ? "desc" : "asc");
        setOrderBy(property);
    };

    const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            setSelected(rows.map((row) => getRowId(row)));
        } else {
            setSelected([]);
        }
    };

    const handleRowClick = (id: number) => {
        setSelected((prev) =>
            prev.includes(id)
                ? prev.filter((item) => item !== id)
                : [...prev, id]
        );
    };

    // 🔎 FILTROS + BÚSQUEDA
    const filteredRows = React.useMemo(() => {
        return rows.filter((row) => {
            // Global search
            const matchesSearch =
                search === "" ||
                Object.values(row as any).some((value) =>
                    String(value).toLowerCase().includes(search.toLowerCase())
                );

            const matchesColumnFilters = columns.every((column) => {
                const filterValue = columnFilters[column.field];
                if (!filterValue) return true;

                return String(row[column.field])
                    .toLowerCase()
                    .includes(filterValue.toLowerCase());
            });

            return matchesSearch && matchesColumnFilters;
        });
    }, [rows, search, columnFilters]);

    // 🔃 SORT
    const sortedRows = React.useMemo(() => {
        return [...filteredRows].sort((a, b) => {
            const aValue = a[orderBy];
            const bValue = b[orderBy];

            if (bValue < aValue) return order === "asc" ? 1 : -1;
            if (bValue > aValue) return order === "asc" ? -1 : 1;
            return 0;
        });
    }, [filteredRows, order, orderBy]);

    const visibleRows = sortedRows.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    return (
        <Box sx={{ width: "100%" }}>
            <Paper sx={{ width: "100%", mb: 2 }}>
                <Toolbar sx={{ display: "flex", gap: 2 }}>
                    <Typography sx={{ flex: "1 1 auto" }} variant="h6">
                        {title}
                    </Typography>

                    {/* 🔍 BÚSQUEDA GLOBAL */}
                    <TextField
                        size="small"
                        placeholder="Buscar..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </Toolbar>

                <TableContainer>
                    <Table size={"small"}>
                        <TableHead>
                            <TableRow>
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        checked={
                                            filteredRows.length > 0 &&
                                            selected.length === filteredRows.length
                                        }
                                        indeterminate={
                                            selected.length > 0 &&
                                            selected.length < filteredRows.length
                                        }
                                        onChange={handleSelectAll}
                                    />
                                </TableCell>

                                {columns.map((column) => (
                                    <TableCell
                                        key={String(column.field)}
                                        align={column.numeric ? "right" : "left"}
                                        sortDirection={
                                            orderBy === column.field ? order : false
                                        }
                                    >
                                        <TableSortLabel
                                            active={orderBy === column.field}
                                            direction={
                                                orderBy === column.field ? order : "asc"
                                            }
                                            onClick={() =>
                                                handleRequestSort(column.field)
                                            }
                                        >
                                            {column.headerName}
                                        </TableSortLabel>

                                        {/* 🔽 FILTRO POR COLUMNA */}
                                        {column.filterable && (
                                            <TextField
                                                size="small"
                                                variant="standard"
                                                placeholder="Filtrar"
                                                value={
                                                    columnFilters[column.field] || ""
                                                }
                                                onChange={(e) =>
                                                    setColumnFilters((prev) => ({
                                                        ...prev,
                                                        [column.field]: e.target.value,
                                                    }))
                                                }
                                            />
                                        )}
                                    </TableCell>
                                ))}

                                {/* ⚙ ACCIONES */}
                                <TableCell align="center">
                                    Acciones
                                </TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {visibleRows.map((row) => {
                                const id = getRowId(row);
                                const isSelected = selected.includes(id);

                                return (
                                    <TableRow
                                        key={id}
                                        hover
                                        selected={isSelected}
                                        onClick={() => handleRowClick(id)}
                                        sx={{ cursor: "pointer" }}
                                    >
                                        <TableCell padding="checkbox">
                                            <Checkbox checked={isSelected} />
                                        </TableCell>

                                        {columns.map((column) => (
                                            <TableCell
                                                key={String(column.field)}
                                                align={column.numeric ? "right" : "left"}
                                            >
                                                {String(row[column.field])}
                                            </TableCell>
                                        ))}

                                        {/* BOTONES */}
                                        <TableCell align="center">
                                            <Stack direction="row" spacing={1} justifyContent="center">
                                                <IconButton
                                                    color="primary"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onEditRow?.(row);
                                                    }}
                                                >
                                                    <EditIcon />
                                                </IconButton>

                                                <IconButton
                                                    color="error"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onDeleteRow?.(row);
                                                    }}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={filteredRows.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={(_, newPage) => setPage(newPage)}
                    onRowsPerPageChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value, 10));
                        setPage(0);
                    }}
                />
            </Paper>
        </Box>
    );
}