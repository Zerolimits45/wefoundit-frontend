import React, { useEffect } from 'react'
import { useState } from 'react'
import { Typography, Stack, IconButton, Button, Divider, Box, CircularProgress, Dialog, AppBar, Toolbar, useMediaQuery, useTheme, DialogContent, Chip, Grid2, TextField, MenuItem, Alert, ButtonBase, Card, CardContent, CardMedia } from '@mui/material'
import { useNavigate, Link } from 'react-router-dom';
import { WarningRounded, CloseRounded, MoreVertRounded, FileDownloadOffRounded, PersonRounded, EditRounded, RefreshRounded, Looks3Rounded, LooksTwoRounded, LooksOneRounded, CheckRounded, AccessTimeRounded, HourglassTopRounded, NewReleasesRounded, SaveRounded, EditOffRounded, UploadFileRounded, InsertDriveFileRounded, DownloadRounded, DeleteRounded, CategoryRounded } from '@mui/icons-material';
import { get, put } from 'aws-amplify/api';
import UserInfoPopover from './UserInfoPopover';
import TaskPopover from './TaskPopover';
import { useFormik } from 'formik';
import * as Yup from "yup";
import { LoadingButton } from '@mui/lab';
import { enqueueSnackbar } from 'notistack';

export default function ItemDialog(props) {
    const navigate = useNavigate()
    const [item, setItem] = useState(null)
    const [loading, setLoading] = useState(true)
    const [attachments, setAttachments] = useState([])
    const [attachmentLoading, setAttachmentLoading] = useState(true)
    const [attachmentError, setAttachmentError] = useState(false)
    const [error, setError] = useState(false)
    const [UserInfoPopoverOpen, setUserInfoPopoverOpen] = useState(false)
    const [UserInfoPopoverAnchorEl, setUserInfoPopoverAnchorEl] = useState(null)
    const [UserInfoPopoverUserId, setUserInfoPopoverUserId] = useState(null)
    const [TaskPopoverOpen, setTaskPopoverOpen] = useState(false)
    const [TaskPopoverAnchorEl, setTaskPopoverAnchorEl] = useState(null)
    const [editLoading, setEditLoading] = useState(false)
    const [editMode, setEditMode] = useState(false)
    const [loadingUploadAttachment, setLoadingUploadAttachment] = useState(false)
    const [category, setCategory] = useState([])
    const theme = useTheme()
    const api_url = import.meta.env.VITE_API_URL
    const bucket_url = import.meta.env.VITE_BUCKET_URL

    const editFormik = useFormik({
        initialValues: {
            name: "",
            description: "",
            categoryId: 1,
        },
        validationSchema: Yup.object({
            name: Yup.string().required("Item name is required"),
            description: Yup.string().required("Description is required"),
            categoryId: Yup.number().required("Category is required"),
        }),
        onSubmit: async (values) => {
            if (values.name != item.name || values.description != item.description || values.categoryId != item.categoryId) {
                // Perform update
                setEditLoading(true)

                var data = {
                    name: values.name,
                    description: values.description,
                    categoryId: values.categoryId,
                }

                var req = put({
                    apiName: "midori",
                    path: "/admin/items/" + props.itemId,
                    options: {
                        body: {
                            ...data
                        }
                    }
                })

                try {
                    var res = await req.response
                    setEditLoading(false)
                    setEditMode(false)
                    handleGetItem(props.itemId)

                    // Call onUpdate function if it exists
                    if (props.onUpdate) {
                        props.onUpdate()
                    }
                } catch (err) {
                    console.log(err)
                    enqueueSnackbar("Failed to update item", { variant: "error" })
                    setEditLoading(false)
                }
            } else {
                setEditMode(false)
            }
        }
    })

    const handleGetItem = async (id) => {
        editMode && setEditMode(false)
        setLoading(true)
        handleGetAttachments(id)
        setError(false)
        var req = get({
            apiName: "midori",
            path: "/items/" + id,
        })

        try {
            var res = await req.response
            var data = await res.body.json()
            console.log(data)
            setItem(data)
            editFormik.setValues({
                name: data.name,
                description: data.description,
                categoryId: data.categoryId,
            })
            setLoading(false)
        } catch (err) {
            console.log(err)
            setError(true)
            setLoading(false)
        }
    }

    const handleGetAttachments = async (id) => {
        setAttachmentLoading(true)
        var attachmentsReq = get({
            apiName: "midori",
            path: "/items/" + id + "/attachments",
        })

        try {
            var attachmentsRes = await attachmentsReq.response
            var attachmentsData = await attachmentsRes.body.json()
            setAttachments(attachmentsData)
            setAttachmentLoading(false)
        } catch (err) {
            console.log(err)
            setAttachmentError(true)
            setAttachmentLoading(false)
        }
    }

    const handleShowUserInformation = (e, userId) => {
        setUserInfoPopoverUserId(userId)
        setUserInfoPopoverAnchorEl(e.currentTarget)
        setUserInfoPopoverOpen(true)
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
        } catch (err) {
            console.log(err)
            enqueueSnackbar("Failed to load item categories", { variant: "error" })
        }
    }

    const handleOptionsClick = (e) => {
        setTaskPopoverAnchorEl(e.currentTarget)
        setTaskPopoverOpen(true)
    }

    useEffect(() => {
        if (props.open && props.itemId) {
            handleGetItem(props.itemId)
        }
    }, [props.open])

    useEffect(() => {
        if (editMode) {
            handleGetCategories()
        }
    }, [editMode])

    const handleUploadAttachment = (e) => {
        setLoadingPicture(true);
        console.log(e);
        const formData = new FormData();
        formData.append("file", e.target.files[0]);
    }


    return (
        <>
            <Dialog
                fullScreen={useMediaQuery(theme.breakpoints.down('md'))}
                open={props.open}
                onClose={props.onClose}
                maxWidth="md"
                fullWidth
            >
                <AppBar sx={{ position: 'relative' }}>
                    <Toolbar>
                        <IconButton
                            edge="start"
                            color="inherit"
                            onClick={props.onClose}
                            aria-label="close"
                        >
                            <CloseRounded />
                        </IconButton>
                        <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                            Item Details
                        </Typography>
                        {(item && !loading && !error && !editMode && !props.guestMode) && (
                            <Button onClick={() => setEditMode(true)} startIcon={<EditRounded />} color="inherit">Edit</Button>
                        )}
                        {(item && !loading && !error && editMode) && (
                            <>
                                <LoadingButton
                                    color="inherit"
                                    onClick={editFormik.handleSubmit}
                                    loading={editLoading}
                                    startIcon={<SaveRounded />}
                                    loadingPosition='start'
                                >
                                    Save
                                </LoadingButton>
                                <Button
                                    color="inherit"
                                    onClick={() => setEditMode(false)}
                                    startIcon={<EditOffRounded />}
                                    sx={{ ml: ".5rem" }}
                                >
                                    Cancel
                                </Button>
                            </>
                        )}
                    </Toolbar>
                </AppBar>
                <DialogContent>
                    {loading && (
                        <Stack direction={"column"} spacing={2} my={"3rem"} sx={{ justifyContent: "center", alignItems: "center" }}>
                            <CircularProgress />
                            <Typography variant="body1" color="grey">Loading item details...</Typography>
                        </Stack>
                    )}
                    {(!loading && error) && (
                        <Stack direction={"column"} spacing={2} my={"3rem"} sx={{ justifyContent: "center", alignItems: "center" }}>
                            <WarningRounded sx={{ height: "48px", width: "48px", color: "grey" }} />
                            <Typography variant="body1" color="grey">Failed to get item</Typography>
                            <Button variant="secondary" onClick={() => { handleGetTask(props.itemId) }} startIcon={<RefreshRounded />}>Retry</Button>
                        </Stack>
                    )}
                    {(!loading && !error && item) && (
                        <>
                            {(editMode) && (
                                <Alert severity="info" sx={{ mb: "1rem" }}>You are in edit mode. Make sure to save your changes.</Alert>
                            )}
                            <Grid2 container spacing={2}>
                                <Grid2 size={{ xs: 12, sm: 8, md: 9 }}>
                                    {editMode && (
                                        <>
                                            <Typography variant="body1" fontWeight={700}>Item Name</Typography>
                                            <TextField
                                                fullWidth
                                                id="name"
                                                name="name"
                                                hiddenLabel
                                                value={editFormik.values.name}
                                                onChange={editFormik.handleChange}
                                                error={editFormik.touched.name && Boolean(editFormik.errors.name)}
                                                helperText={editFormik.touched.name && editFormik.errors.name}
                                                sx={{ mb: "0.5rem" }}
                                                size='small'
                                            />
                                        </>
                                    )}
                                    {!editMode && (
                                        <Typography variant="h5" fontWeight={700}>{item.name}</Typography>
                                    )}
                                    <Typography fontSize={"0.75rem"} color='grey'>Created on {
                                        new Date(item.created_at).toLocaleDateString("en-US", {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        }) + " " + new Date(item.created_at).toLocaleTimeString("en-US", {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })
                                    }</Typography>
                                    <Divider sx={{ my: "0.5rem" }} />
                                    <Box mb={"1rem"}>
                                        <Typography variant="body1" fontWeight={700}>Item Description</Typography>
                                        {editMode && (
                                            <TextField
                                                fullWidth
                                                multiline
                                                minRows={5}
                                                id="description"
                                                name="description"
                                                hiddenLabel
                                                value={editFormik.values.description}
                                                onChange={editFormik.handleChange}
                                                error={editFormik.touched.description && Boolean(editFormik.errors.description)}
                                                helperText={editFormik.touched.description && editFormik.errors.description}
                                                sx={{ mb: "0.5rem" }}
                                                size='small'
                                            />
                                        )}
                                        {!editMode && (
                                            <>

                                                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                                                    {item.description}
                                                </Typography>
                                            </>
                                        )}
                                    </Box>
                                    <Box>
                                        <Typography variant="body1" fontWeight={700} mb={"0.5rem"}>Item Attachments</Typography>
                                        {((!attachments || attachments.length == 0) && !attachmentLoading && !attachmentError) && (
                                            <Stack direction={"column"} spacing={'0.5rem'} py={"2rem"} sx={{ justifyContent: "center", alignItems: "center", borderRadius: "10px", border: "1px solid lightgrey" }}>
                                                <FileDownloadOffRounded sx={{ height: "32px", width: "32px", color: "grey" }} />
                                                <Typography variant="body1" color="grey">No Attachments</Typography>
                                            </Stack>
                                        )}
                                        {(!attachmentLoading && attachmentError) && (
                                            <Stack direction={"column"} spacing={'0.5rem'} py={"2rem"} sx={{ justifyContent: "center", alignItems: "center", borderRadius: "10px", border: "1px solid lightgrey" }}>
                                                <WarningRounded sx={{ height: "32px", width: "32px", color: "grey" }} />
                                                <Typography variant="body1" color="grey">Error loading attachments</Typography>
                                                <Button variant="secondary" onClick={() => { handleGetAttachments(props.taskId) }} startIcon={<RefreshRounded />}>Retry</Button>
                                            </Stack>
                                        )}
                                        {attachmentLoading && (
                                            <Stack direction={"column"} spacing={'0.5rem'} py={"2rem"} sx={{ justifyContent: "center", alignItems: "center", borderRadius: "10px", border: "1px solid lightgrey" }}>
                                                <CircularProgress />
                                                <Typography variant="body1" color="grey">Loading attachments...</Typography>
                                            </Stack>
                                        )}
                                        <Grid2 container spacing={1}>
                                            {(attachments && !attachmentLoading) && attachments.map(attachment => (
                                                <Grid2 size={{ xs: 12, md: 6 }}>
                                                    <Card variant='outlined'>
                                                        <CardMedia
                                                            component="img"
                                                            height="150"
                                                            src={bucket_url + "/items/" + props.itemId + "/" + attachment.replace(" ", "+")}
                                                            sx={{ backgroundColor: "lightgrey", objectFit: "contain" }}
                                                        />
                                                        <CardContent>
                                                            <Box sx={{ display: "flex", alignItems: "center" }}>
                                                                <InsertDriveFileRounded sx={{ color: "grey", mr: "0.5rem" }} />
                                                                <Box overflow={"hidden"}>
                                                                    <Typography variant="body1" fontWeight={700} sx={{ textOverflow: "ellipsis", width: "100%" }} noWrap>
                                                                        {attachment}
                                                                    </Typography>
                                                                    <Typography variant="body2">.{attachment.split(".").at(-1)} format</Typography>
                                                                </Box>
                                                            </Box>
                                                            <Stack direction={"row"} spacing={1} mt={"1rem"}>
                                                                <IconButton color={theme.palette.primary.main} size='small' LinkComponent={Link} to={api_url + "/items/" + props.itemId + "/attachments/" + attachment} target="_blank">
                                                                    <DownloadRounded />
                                                                </IconButton>
                                                                {!props.guestMode && (
                                                                    <IconButton color={theme.palette.primary.main} size='small'>
                                                                        <DeleteRounded />
                                                                    </IconButton>
                                                                )}
                                                            </Stack>
                                                        </CardContent>
                                                    </Card>
                                                </Grid2>
                                            )
                                            )}
                                        </Grid2>
                                        {!props.guestMode && (
                                            <LoadingButton loading={attachmentLoading} component="label" variant="secondary" startIcon={<UploadFileRounded />} fullWidth size='small' sx={{ mt: "0.5rem" }}>Upload Attachment<input type='file' onChange={handleUploadAttachment} hidden /></LoadingButton>
                                        )}
                                    </Box>
                                </Grid2>
                                <Grid2 size={{ xs: 12, sm: 4, md: 3 }}>
                                    <Grid2 container spacing={2}>
                                        <Grid2 size={{ xs: 12 }}>
                                            <Typography variant="body1" fontWeight={700}>Category</Typography>
                                            {editMode && (
                                                <TextField
                                                    select
                                                    fullWidth
                                                    id="categoryId"
                                                    name="categoryId"
                                                    hiddenLabel
                                                    value={editFormik.values.categoryId}
                                                    onChange={editFormik.handleChange}
                                                    error={editFormik.touched.categoryId && Boolean(editFormik.errors.categoryId)}
                                                    helperText={editFormik.touched.categoryId && editFormik.errors.categoryId}
                                                    size='small'

                                                >
                                                    {category.map((cat) => (
                                                        <MenuItem key={cat.id} value={cat.id}>
                                                            {cat.name}
                                                        </MenuItem>
                                                    ))}
                                                </TextField>
                                            )}
                                            {!editMode && (
                                                <>
                                                    <Chip icon={<CategoryRounded />} label={item.categoryName} color="info" size='small' />
                                                </>
                                            )}

                                        </Grid2>
                                        <Grid2 size={{ xs: 12 }}>
                                            <Typography variant="body1" fontWeight={700}>Created By</Typography>
                                            <Chip icon={<PersonRounded />} label={item.created_by} size='small' onClick={(e) => { handleShowUserInformation(e, item.created_by) }} />
                                        </Grid2>
                                    </Grid2>
                                </Grid2>
                            </Grid2>
                        </>
                    )}
                </DialogContent>
            </Dialog>
            <UserInfoPopover open={UserInfoPopoverOpen} anchor={UserInfoPopoverAnchorEl} onClose={() => setUserInfoPopoverOpen(false)} userId={UserInfoPopoverUserId} />
        </>

    )
}