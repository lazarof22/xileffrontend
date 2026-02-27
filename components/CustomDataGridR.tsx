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
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Grid,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";

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

    const handleExportPDF = () => {
        const doc = new jsPDF();

        doc.setFontSize(16);
        doc.text(title, 14, 15);

        const tableColumn = columns.map((col) => col.headerName);

        const tableRows = filteredRows.map((row) =>
            columns.map((col) => String(row[col.field]))
        );

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 20,
        });

        doc.save(`${title}.pdf`);
    };

    const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false);
    const [rowToDelete, setRowToDelete] = React.useState<T | null>(null);
    const [openEditDialog, setOpenEditDialog] = React.useState(false);
    const [rowToEdit, setRowToEdit] = React.useState<T | null>(null);
    const [editForm, setEditForm] = React.useState<Partial<T>>({});

    const handleEditChange = (field: keyof T, value: any) => {
        setEditForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    return (
        <Box sx={{ width: '100%', overflowX: 'auto' }}>
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
                    <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        startIcon={<PictureAsPdfIcon sx={{ fontSize: "medium" }} />}
                        onClick={handleExportPDF}>
                        Exportar PDF
                    </Button>
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
                                                        setRowToEdit(row);
                                                        setEditForm(row);
                                                        setOpenEditDialog(true);
                                                    }}
                                                >
                                                    <EditIcon />
                                                </IconButton>

                                                <IconButton
                                                    color="error"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setRowToDelete(row);
                                                        setOpenDeleteDialog(true);
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
            <Dialog
                open={openDeleteDialog}
                onClose={() => setOpenDeleteDialog(false)}
            >
                <DialogTitle>Confirmar eliminación</DialogTitle>

                <DialogContent>
                    <DialogContentText>
                        ¿Estás seguro que deseas eliminar este registro?
                        Esta acción no se puede deshacer.
                    </DialogContentText>
                </DialogContent>

                <DialogActions>
                    <Button
                        onClick={() => setOpenDeleteDialog(false)}
                        color="inherit"
                    >
                        Cancelar
                    </Button>

                    <Button
                        onClick={() => {
                            if (rowToDelete) {
                                onDeleteRow?.(rowToDelete);
                            }
                            setOpenDeleteDialog(false);
                            setRowToDelete(null);
                        }}
                        color="error"
                        variant="contained"
                    >
                        Eliminar
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={openEditDialog}
                onClose={() => setOpenEditDialog(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Editar Registro</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        {columns.map((column) => (
                            <Grid item xs={12} key={String(column.field)}>
                                <TextField
                                    fullWidth
                                    label={column.headerName}
                                    value={editForm[column.field] ?? ""}
                                    onChange={(e) =>
                                        handleEditChange(column.field, e.target.value)
                                    }
                                />
                            </Grid>
                        ))}
                    </Grid>
                </DialogContent>

                <DialogActions>
                    <Button
                        onClick={() => setOpenEditDialog(false)}
                        color="inherit"
                    >
                        Cancelar
                    </Button>

                    <Button
                        variant="contained"
                        onClick={() => {
                            if (rowToEdit) {
                                const updatedRow = {
                                    ...rowToEdit,
                                    ...editForm,
                                };
                                onEditRow?.(updatedRow);
                            }
                            setOpenEditDialog(false);
                            setRowToEdit(null);
                        }}
                    >
                        Guardar Cambios
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}