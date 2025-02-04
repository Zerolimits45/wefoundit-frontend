import React, { useEffect, useState, useContext, useRef } from 'react'
import { Button, Dialog, DialogContent, DialogContentText, DialogTitle, DialogActions, Box, Card, CardContent, Typography, Divider, AppBar, Toolbar, IconButton, Grid2, TextField, useMediaQuery, useTheme, MenuItem } from '@mui/material'
import LoadingButton from '@mui/lab/LoadingButton/LoadingButton';
import { DataGrid, GridActionsCellItem, GridToolbarExport } from '@mui/x-data-grid';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import http from '../../../http';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import { AddRounded, CloseRounded, RefreshRounded, UploadFileRounded, VisibilityRounded } from '@mui/icons-material';
import titleHelper from '../../../functions/helpers';
import { get, post, del } from "aws-amplify/api";
import { enqueueSnackbar } from 'notistack';
import { CategoryContext } from './ItemRoutes';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { FilePond, registerPlugin } from 'react-filepond';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';
import 'filepond/dist/filepond.min.css';
import CardTitle from '../../../components/CardTitle';
import ItemDialog from '../../../components/ItemDialog';

function ViewItems() {

    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [categoryLoading, setCategoryLoading] = useState(true)
    const [deleteLoading, setDeleteLoading] = useState(null)
    const [deleteItemDialog, setDeleteItemDialog] = useState(false)
    const [createDialogOpen, setCreateDialogOpen] = useState(false)
    const [createLoading, setCreateLoading] = useState(false)
    const [filepondUrl, setFilepondUrl] = useState(null)
    const [category, setCategory] = useState(null)
    const [deleteItem, setDeleteItem] = useState(null)
    const [newItemFiles, setNewItemFiles] = useState([])
    const [filepondToken, setFilepondToken] = useState(null)
    const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
    const [detailsId, setDetailsId] = useState(null)
    const { setActivePage } = useContext(CategoryContext)
    const filepondRef = useRef(null)
    const navigate = useNavigate()
    const theme = useTheme()
    titleHelper("Manage Items")

    registerPlugin(FilePondPluginImagePreview);
    registerPlugin(FilePondPluginFileValidateType);

    const columns = [
        { field: 'name', headerName: 'Item Name', width: 200 },
        { field: 'description', headerName: 'Item Description', minWidth: 150, flex: 1 },
        { field: 'categoryName', headerName: 'Item Category', minWidth: 150 },
        { field: 'created_at', headerName: 'Found On', type: 'datetime', minWidth: 150, valueGetter: (value) => new Date(value).toLocaleDateString() },
        {
            field: 'actions', headerName: "Actions", type: 'actions', width: 80, getActions: (params) => [
                <GridActionsCellItem
                    icon={<VisibilityRounded />}
                    label="View Item"
                    onClick={() => {
                        handleDetailsOpen(params.row.id)
                    }}
                />,
                <GridActionsCellItem
                    icon={<DeleteIcon />}
                    label="Delete Item"
                    onClick={() => {
                        setDeleteItem(params.row)
                        handleDeleteItemOpen()
                    }}
                />
            ]
        },
    ];

    const createItemFormik = useFormik({
        initialValues: {
            name: "",
            categoryId: 1,
            description: ""
        },
        validationSchema: yup.object({
            name: yup.string().required("Item name is required"),
            categoryId: yup.number().required("Item category is required"),
            description: yup.string().required("Item description is required")
        }),
        onSubmit: async (values) => {
            setCreateLoading(true)
            var itemReq = post({
                apiName: "midori",
                path: "/admin/items",
                options: {
                    body: {
                        ...values
                    }
                }
            })

            try {
                var res = await itemReq.response
                var data = await res.body.json()
                // upload images using filepond via API env (/admin/items/{id}/attachments)
                setFilepondUrl(import.meta.env.VITE_API_URL + "/admin/items/" + data.id + "/attachments")
                filepondRef.current.processFiles().then(() => {
                    console.log("Files processed")
                    enqueueSnackbar("Item created successfully", { variant: "success" })
                    setCreateLoading(false)
                    // clear form
                    createItemFormik.resetForm()
                    setNewItemFiles([])
                    handleNewClose()
                    handleGetItems()
                }).catch((err) => {
                    console.log(err)
                    enqueueSnackbar("Failed to upload images", { variant: "error" })
                    setCreateLoading(false)
                })


            } catch (err) {
                console.log(err)
                enqueueSnackbar("Failed to create item", { variant: "error" })
                setCreateLoading(false)
            }
        }
    })


    const handleDeleteItemClose = () => {
        setDeleteItemDialog(false)
    }

    const handleDeleteItemOpen = () => {
        setDeleteItemDialog(true)
    }

    const handleNewClose = () => {
        setCreateDialogOpen(false)
    }

    const handleNewOpen = () => {
        handleGetCategories()
        setCreateDialogOpen(true)
    }

    const handleDetailsClose = () => {
        setDetailsDialogOpen(false)
    }

    const handleDetailsOpen = (id) => {
        setDetailsId(id)
        setDetailsDialogOpen(true)
    }

    const handleOnDelete = () => {
        handleGetItems()
    }

    const handleDeleteItem = async () => {
        setDeleteLoading(true)
        var itemReq = del({
            apiName: "midori",
            path: "/admin/items/" + deleteItem.id,
        })

        try {
            var res = await itemReq.response
            enqueueSnackbar("Item deleted successfully", { variant: "success" })
            setDeleteLoading(false)
            handleDeleteItemClose()
            handleGetItems()
        } catch (err) {
            console.log(err)
            enqueueSnackbar("Failed to delete item", { variant: "error" })
            setDeleteLoading(false)
        }
    }

    const handleGetCategories = async () => {
        var itemReq = get({
            apiName: "midori",
            path: "/categories",
        })

        try {
            var res = await itemReq.response
            var data = await res.body.json()
            setCategory(data)
            setCategoryLoading(false)
        } catch (err) {
            console.log(err)
            enqueueSnackbar("Failed to load item categories", { variant: "error" })
        }
    }

    const handleGetItems = async () => {
        setLoading(true)
        var itemReq = get({
            apiName: "midori",
            path: "/items",
        })

        try {
            var res = await itemReq.response
            var data = await res.body.json()
            setItems(data)
            setLoading(false)
        } catch (err) {
            console.log(err)
            enqueueSnackbar("Failed to load items", { variant: "error" })
            setLoading(false)
        }
    }

    const customToolbar = () => {
        return (
            <GridToolbarExport />
        );
    }

    useEffect(() => {
        handleGetItems()
        setActivePage(0)

        // check if param has new
        const urlParams = new URLSearchParams(window.location.search);
        const newParam = urlParams.get('new');
        if (newParam) {
            handleNewOpen()
        }

        setFilepondToken(localStorage.getItem("token"))
    }, [])

    return (
        <>
            <Box sx={{ marginY: "1rem" }}>
                <Box display={{ xs: "none", md: "block" }}>
                    <Typography variant="h4" my={"2rem"} fontWeight={700}>Manage Items</Typography>
                    <Divider sx={{ mb: "1rem" }} />
                </Box>
                <Box display={"flex"}>
                    <Button variant="contained" startIcon={<AddRounded />} onClick={handleNewOpen}>New Item</Button>
                    <LoadingButton loadingPosition='start' variant="outlined" startIcon={<RefreshRounded />} onClick={handleGetItems} loading={loading} sx={{ ml: "1rem" }}>Refresh</LoadingButton>
                </Box>
                <DataGrid
                    rows={items}
                    columns={columns}
                    pageSize={10}
                    loading={loading}
                    autoHeight
                    slots={{ toolbar: customToolbar }}
                    sx={{ mt: "1rem" }}
                />
            </Box>
            <Dialog open={deleteItemDialog} onClose={handleDeleteItemClose}>
                <DialogTitle>Delete Item</DialogTitle>
                <DialogContent sx={{ paddingTop: 0 }}>
                    <DialogContentText>
                        Are you sure you want to delete the item?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteItemClose} startIcon={<CloseIcon />}>Cancel</Button>
                    <LoadingButton type="submit" loadingPosition="start" loading={deleteLoading} variant="text" color="error" startIcon={<DeleteIcon />} onClick={handleDeleteItem}>Delete</LoadingButton>
                </DialogActions>
            </Dialog>
            <Dialog
                fullScreen={useMediaQuery(theme.breakpoints.down('md'))}
                open={createDialogOpen}
                onClose={handleNewClose}
                maxWidth="md"
                fullWidth
            >
                <AppBar sx={{ position: 'relative' }}>
                    <Toolbar>
                        <IconButton
                            edge="start"
                            color="inherit"
                            onClick={handleNewClose}
                            aria-label="close"
                        >
                            <CloseRounded />
                        </IconButton>
                        <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                            Create Found Item
                        </Typography>
                        <LoadingButton autoFocus color="inherit" onClick={createItemFormik.handleSubmit} loading={createLoading} loadingPosition='start' startIcon={<AddRounded />}>
                            Create
                        </LoadingButton>
                    </Toolbar>
                </AppBar>
                <DialogContent>
                    <Grid2 container spacing={2}>
                        <Grid2 size={{ xs: 12, sm: 6 }}>
                            <TextField
                                fullWidth
                                id="name"
                                name="name"
                                label="Item Name"
                                variant="outlined"
                                value={createItemFormik.values.name}
                                onChange={createItemFormik.handleChange}
                                error={createItemFormik.touched.name && Boolean(createItemFormik.errors.name)}
                                helperText={createItemFormik.touched.name && createItemFormik.errors.name}
                                readonly={createLoading}
                            />
                        </Grid2>
                        <Grid2 size={{ xs: 12, sm: 6 }}>
                            <TextField
                                select
                                fullWidth
                                id="categoryId"
                                name="categoryId"
                                label="Item Category"
                                variant="outlined"
                                value={createItemFormik.values.categoryId}
                                onChange={createItemFormik.handleChange}
                                error={createItemFormik.touched.categoryId && Boolean(createItemFormik.errors.categoryId)}
                                helperText={createItemFormik.touched.categoryId && createItemFormik.errors.categoryId}
                                readonly={createLoading}
                            >
                                {category && category.map((cat) => (
                                    <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                                ))}
                            </TextField>
                        </Grid2>
                        <Grid2 size={{ xs: 12 }}>
                            <TextField
                                fullWidth
                                multiline
                                minRows={7}
                                id="description"
                                name="description"
                                label="Description of the item (size, color, model, etc)"
                                variant="outlined"
                                value={createItemFormik.values.description}
                                onChange={createItemFormik.handleChange}
                                error={createItemFormik.touched.description && Boolean(createItemFormik.errors.description)}
                                helperText={createItemFormik.touched.description && createItemFormik.errors.description}
                                readonly={createLoading}
                            />
                        </Grid2>
                        <Grid2 size={{ xs: 12 }}>
                            <Divider />
                        </Grid2>
                        <Grid2 size={{ xs: 12 }}>
                            <CardTitle title="Upload Images" icon={<UploadFileRounded />} />
                            <Typography variant="body2" color="textSecondary" mb={"1rem"}>Upload up to 3 images of the item</Typography>
                            <FilePond
                                ref={filepondRef}
                                files={newItemFiles}
                                allowMultiple={true}
                                maxFiles={3}
                                onupdatefiles={(fileItems) => {
                                    setNewItemFiles(fileItems.map((fileItem) => fileItem.file));
                                }}
                                credits={false}
                                instantUpload={false}
                                allowRevert={false}
                                allowProcess={false}
                                allowReplace={false}
                                allowReorder={true}
                                acceptedFileTypes={['image/*']}
                                disabled={createLoading}
                                imagePreviewMaxHeight={200}
                                server={{
                                    url: filepondUrl,
                                    process: {
                                        method: 'POST',
                                        headers: {
                                            Authorization: filepondToken
                                        },
                                    },
                                }}
                            ></FilePond>
                        </Grid2>
                    </Grid2>
                </DialogContent>
            </Dialog>
            <ItemDialog open={detailsDialogOpen} onClose={handleDetailsClose} itemId={detailsId} onDelete={handleOnDelete} onUpdate={handleGetItems} />
        </>
    )
}

export default ViewItems