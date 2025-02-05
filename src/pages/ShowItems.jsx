import { useContext, useEffect, useState, Suspense, useRef, useLayoutEffect } from 'react'
import { Route, Routes, Navigate, Link, Form } from 'react-router-dom'
import { Button, Container, Divider, Typography, Box, Card, TextField, Skeleton, CardContent, CardMedia, Chip, Alert, Collapse, Grid, Stack, Grid2, useTheme, CardActions, Badge, Select, DialogContent, DialogContentText, DialogActions, Dialog, DialogTitle, Stepper, Step, StepLabel, MenuItem } from '@mui/material'
import { AppContext } from '../App';
import { ArrowForwardRounded, CategoryRounded, CheckRounded, CloseRounded, HomeRounded, InfoRounded, LoginRounded, NewReleasesRounded, NotificationAddRounded, NotificationsActiveRounded, NotificationsOffRounded, RefreshRounded, SearchRounded, WarningRounded } from '@mui/icons-material';
import titleHelper from '../functions/helpers';
import { useSnackbar } from "notistack";
import { LoadingButton } from '@mui/lab';
import CardTitle from '../components/CardTitle';
import InfoBox from '../components/InfoBox';
import ItemDialog from '../components/ItemDialog';
import { get, post } from 'aws-amplify/api';
import { useFormik } from 'formik';
import * as Yup from 'yup';


export default function ViewItems() {
    // Routes for admin pages. To add authenication so that only admins can access these pages, add a check for the user's role in the UserContext
    //const { setIsAdminPage } = useContext(UserContext);
    titleHelper("Search Items")
    const apiUrl = import.meta.env.VITE_API_URL;
    const bucket_url = import.meta.env.VITE_BUCKET_URL
    const [items, setItems] = useState([])
    const [category, setCategory] = useState([])
    const [loading, setLoading] = useState(false)
    const [categoryLoading, setCategoryLoading] = useState(true)
    const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
    const [detailsId, setDetailsId] = useState(null)
    const [selectedCategory, setSelectedCategory] = useState(null)
    const [subcribeCatergoryDialog, setSubcribeCategoryDialog] = useState(false)
    const [subscribeStep, setSubscribeStep] = useState(0)
    const [subscribeLoading, setSubscribeLoading] = useState(false)

    const { enqueueSnackbar } = useSnackbar();
    const theme = useTheme()

    const subscribeFormik = useFormik({
        initialValues: {
            email: "",
            categoryIds: []
        },
        validationSchema: Yup.object({
            email: Yup.string().email("Invalid email address").required("E-mail is required"),
        }),
        onSubmit: async (data) => {
            setSubscribeLoading(true)
            data.email = data.email.trim()

            var subReq = post({
                apiName: "midori",
                path: "/subscriptions?email=" + data.email,
                options: {
                    body: {
                        categoryIds: data.categoryIds
                    }
                }
            })

            try {
                var res = await subReq.response
                var data = await res.body.json()
                setSubscribeLoading(false)
                setSubscribeStep(2)
            } catch (err) {
                console.log(err)
                enqueueSnackbar("Failed to subscribe to categories", { variant: "error" })
                setSubscribeLoading(false)
            }
        }
    })


    const confirmFormik = useFormik({
        initialValues: {
            code: ""
        },
        validationSchema: Yup.object({
            code: Yup.string().required("Confirmation code is required")
        }),
        onSubmit: async (data) => {
            setSubscribeLoading(true)
            data.code = data.code.trim()
            data.email = subscribeFormik.values.email

            var subReq = get({
                apiName: "midori",
                path: "/subscriptions/verify?email=" + data.email + "&token=" + data.code
            })

            try {
                var res = await subReq.response
                var data = await res.body.json()
                setSubscribeLoading(false)
                setSubscribeStep(3)
            } catch (err) {
                console.log(err)
                enqueueSnackbar("Failed to verify subscription", { variant: "error" })
                setSubscribeLoading(false)
            }
        }
    })


    const handleGetItems = async () => {
        setLoading(true)
        setSelectedCategory(null)
        var itemReq = get({
            apiName: "midori",
            path: "/items?attach=true",
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

    const handleGetItemsByCategory = async (id) => {
        setLoading(true)
        setSelectedCategory(id)
        var itemReq = get({
            apiName: "midori",
            path: "/items?attach=true&categoryId=" + id
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

    const handleGetCategories = async () => {
        setCategoryLoading(true)
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
            setCategoryLoading(false)
        }
    }

    const handleDetailsClose = () => {
        setDetailsDialogOpen(false)
    }

    const handleDetailsOpen = (id) => {
        setDetailsId(id)
        setDetailsDialogOpen(true)
    }

    const handleSubscribeCategoryClose = () => {
        setSubscribeStep(0)
        subscribeFormik.resetForm()
        setSubscribeLoading(false)
        setSubcribeCategoryDialog(false)
    }

    const handleSubscribeCategoryOpen = () => {
        setSubcribeCategoryDialog(true)
    }

    const handleSubscribeCategoryNext = async () => {
        // TODO: Get categories user has subscribed to
        setSubscribeLoading(true)

        var subReq = get({
            apiName: "midori",
            path: "/subscriptions?email=" + subscribeFormik.values.email
        })

        try {
            var res = await subReq.response
            var data = await res.body.json()
            var subCategories = data.map((sub) => sub.categoryId)
            subscribeFormik.setFieldValue("categoryIds", subCategories)
            setSubscribeLoading(false)
            setSubscribeStep(1)
        } catch (err) {
            console.log(err)
            enqueueSnackbar("Failed to load subscriptions", { variant: "error" })
            setSubscribeLoading(false)  
        }
    }


    useEffect(() => {
        handleGetItems()
        handleGetCategories()
    }, [])

    return (

        <>
            <Container maxWidth="xl">
                <Box sx={{ marginY: "1rem" }}>
                    <Box display={{ xs: "none", md: "block" }}>
                        <Box display={"flex"} alignItems="center">
                            <SearchRounded sx={{ fontSize: "3rem", color: theme.palette.primary.main, mx: "1rem" }} />
                            <Typography variant="h4" my={"2rem"} ml={"1rem"} fontWeight={700}>All Found Items</Typography>
                        </Box>

                        <Divider sx={{ mb: "1rem" }} />
                    </Box>
                    <Stack direction="row" spacing={"0.5rem"} flexWrap={"wrap"} useFlexGap>
                        <Button variant="contained"onClick={handleSubscribeCategoryOpen}>Add Notification</Button>
                        <LoadingButton loadingPosition='start' variant="outlined" startIcon={<RefreshRounded />} onClick={handleGetItems} loading={loading}>Refresh</LoadingButton>
                    </Stack>
                    <Grid2 container spacing={2} sx={{ mt: "1rem" }}>
                        <Grid2 size={{ md: 3, xs: 12 }}>
                            <Card>
                                <CardContent>
                                    <CardTitle title="Category Filter" icon={<CategoryRounded />} />
                                    <Box sx={{ mt: "1rem" }}>
                                        <Stack direction="row" spacing={"0.5rem"} flexWrap={"wrap"} useFlexGap>
                                            {!categoryLoading && (
                                                <Button variant={
                                                    selectedCategory === null ? "contained" : "outlined"
                                                } onClick={() => {
                                                    handleGetItems()
                                                }}>All</Button>
                                            )}
                                            {categoryLoading && (
                                                <>
                                                    <Skeleton variant="text" width={"5rem"} height={32} animation="wave" />
                                                    <Skeleton variant="text" width={"7rem"} height={32} animation="wave" />
                                                    <Skeleton variant="text" width={"6rem"} height={32} animation="wave" />
                                                    <Skeleton variant="text" width={"4rem"} height={32} animation="wave" />
                                                    <Skeleton variant="text" width={"5rem"} height={32} animation="wave" />
                                                    <Skeleton variant="text" width={"7rem"} height={32} animation="wave" />
                                                    <Skeleton variant="text" width={"6rem"} height={32} animation="wave" />
                                                    <Skeleton variant="text" width={"4rem"} height={32} animation="wave" />
                                                </>
                                            )}
                                            {!categoryLoading && category.map((cat, i) => (
                                                <Button variant={
                                                    selectedCategory === cat.id ? "contained" : "outlined"
                                                } key={i} onClick={() => {
                                                    handleGetItemsByCategory(cat.id)
                                                }}>{cat.name}</Button>
                                            ))}
                                        </Stack>
                                    </Box>

                                </CardContent>
                            </Card>
                        </Grid2>
                        <Grid2 size={{ md: 9, xs: 12 }}>
                            <Grid2 container spacing={2}>
                                {// If items are loading, show skeleton loaders instead of the items}
                                    loading && [1, 2, 3, 4, 5, 6].map((i) => (
                                        <Grid2 size={{ lg: 4, sm: 6, xs: 12 }} key={i}>
                                            <Card sx={{ width: "100%" }}>
                                                <Skeleton variant="rectangular" height={200} animation="wave" />
                                                <CardContent>
                                                    <Stack direction="column" spacing={"0.5rem"}>
                                                        <Skeleton variant="text" width={"15rem"} height={48} animation="wave" />
                                                        <Skeleton variant="text" width={"7rem"} height={24} animation="wave" />

                                                    </Stack>
                                                    <Skeleton variant="text" width={"5rem"} height={32} sx={{ mt: "1rem" }} animation="wave" />
                                                </CardContent>
                                            </Card>
                                        </Grid2>
                                    ))}

                                {
                                    !loading && items.map((item, i) => (
                                        <Grid2 size={{ lg: 4, sm: 6, xs: 12 }} key={i}>
                                            <Card sx={{ width: "100%" }}>
                                                <CardMedia
                                                    sx={{ height: 200, backgroundColor: "darkgrey", objectFit: "contain" }}
                                                    image={item.attachment ? bucket_url + "/items/" + item.id + "/" + item.attachment.replace(" ", "+") : "/icon.png"}
                                                    title="Background"
                                                    objectFit="contain"
                                                    component={"img"}
                                                />
                                                <CardContent>
                                                    <Typography gutterBottom variant="h6" fontWeight={700}>
                                                        {item.name}
                                                    </Typography>
                                                    <Chip label={item.categoryName} size='small' />
                                                </CardContent>
                                                <CardActions>
                                                    <Button size="medium" startIcon={<InfoRounded />} onClick={() => {
                                                        handleDetailsOpen(item.id)
                                                    }}>Item Details</Button>
                                                </CardActions>
                                            </Card>
                                        </Grid2>
                                    ))}

                                {
                                    !loading && items.length === 0 && (
                                        <Grid2 size={{ xs: 12 }}>
                                            <Stack direction={"column"} spacing={'0.5rem'} py={"2rem"} sx={{ justifyContent: "center", alignItems: "center", borderRadius: "10px", border: "1px solid lightgrey" }}>
                                                <CloseRounded sx={{ height: "32px", width: "32px", color: "grey" }} />
                                                <Typography variant="body1" color="grey">No items in category</Typography>
                                            </Stack>
                                        </Grid2>
                                    )}
                            </Grid2>
                        </Grid2>
                    </Grid2>
                </Box>
            </Container>
            <Dialog open={subcribeCatergoryDialog} maxWidth={"sm"} fullWidth onClose={handleSubscribeCategoryClose}>
                <DialogTitle>
                    Add Email Notification
                </DialogTitle>
                <DialogContent>
                    <Stepper activeStep={subscribeStep} alternativeLabel>
                        <Step>
                            <StepLabel>
                                Enter E-mail
                            </StepLabel>
                        </Step>
                        <Step>
                            <StepLabel>
                                Select Categories
                            </StepLabel>
                        </Step>
                        <Step>
                            <StepLabel>
                                Verify E-mail
                            </StepLabel>
                        </Step>
                    </Stepper>
                </DialogContent>
                <Box display={subscribeStep == 0 ? "initial" : "none"}>
                    <DialogContent sx={{ paddingTop: 0 }}>
                        <DialogContentText>
                            Enter your e-mail address. You will receive an email when new items are added to the selected categories.
                        </DialogContentText>
                        <TextField
                            autoFocus
                            margin="dense"
                            id="email"
                            label="E-mail Address"
                            type="email"
                            name="email"
                            fullWidth
                            variant="standard"
                            value={subscribeFormik.values.email}
                            onChange={subscribeFormik.handleChange}
                            error={subscribeFormik.touched.email && Boolean(subscribeFormik.errors.email)}
                            helperText={subscribeFormik.touched.email && subscribeFormik.errors.email}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleSubscribeCategoryClose} startIcon={<CloseRounded />}>Cancel</Button>
                        <LoadingButton type="submit" loadingPosition="start" loading={subscribeLoading} variant="text" color="primary" startIcon={<ArrowForwardRounded />} onClick={handleSubscribeCategoryNext}>Next Step</LoadingButton>
                    </DialogActions>
                </Box>
                <Box display={subscribeStep == 1 ? "initial" : "none"}>
                    <DialogContent sx={{ paddingTop: 0 }}>
                        <DialogContentText>
                            Select the categories you would like to get an email from:
                        </DialogContentText>
                        <Select
                            sx={{ mt: "1rem" }}
                            multiple
                            fullWidth
                            value={subscribeFormik.values.categoryIds}
                            onChange={(e) => {
                                subscribeFormik.setFieldValue("categoryIds", e.target.value)
                            }}
                            renderValue={(selected) => (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {selected.map((value) => (
                                        <Chip icon={<CategoryRounded/>} key={value} label={category.find((cat) => cat.id == value).name}/>
                                    ))}
                                </Box>
                            )}
                        >
                            {category.map((cat) => (
                                <MenuItem key={cat.id} value={cat.id}>
                                    {cat.name}
                                </MenuItem>
                            ))}
                        </Select>
                        <Button sx={{width: "100%", mt:"0.5rem"}} variant='secondary' startIcon={<NotificationsOffRounded />} onClick={() => { subscribeFormik.setFieldValue("categoryIds", []) }}>
                            Unselect from all categories
                        </Button>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleSubscribeCategoryClose} startIcon={<CloseRounded />}>Cancel</Button>
                        <LoadingButton type="submit" loadingPosition="start" loading={subscribeLoading} variant="text" color="primary" startIcon={<ArrowForwardRounded />} onClick={subscribeFormik.handleSubmit}>Next Step</LoadingButton>
                    </DialogActions>
                </Box>
                <Box display={subscribeStep == 2 ? "initial" : "none"} component="form" onSubmit={confirmFormik.handleSubmit}>
                    <DialogContent sx={{ paddingTop: 0 }}>
                        <DialogContentText>
                            An e-mail verification code was sent to your inbox.<br />Key in the code that was sent to your e-mail for confirmation.
                        </DialogContentText>
                        <TextField
                            autoFocus
                            margin="dense"
                            id="code"
                            label="Confirmation Code"
                            type="text"
                            name="code"
                            fullWidth
                            variant="standard"
                            value={confirmFormik.values.code}
                            onChange={confirmFormik.handleChange}
                            error={confirmFormik.touched.code && Boolean(confirmFormik.errors.code)}
                            helperText={confirmFormik.touched.code && confirmFormik.errors.code}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleSubscribeCategoryClose} startIcon={<CloseRounded />}>Cancel</Button>
                        <LoadingButton type="submit" loadingPosition="start" loading={subscribeLoading} variant="text" color="primary" startIcon={<CheckRounded />}>Verify</LoadingButton>
                    </DialogActions>
                </Box>
                <Box display={subscribeStep == 3 ? "initial" : "none"}>
                    <DialogContent sx={{ paddingTop: 0 }}>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                            <NotificationsActiveRounded sx={{ fontSize: "3rem", color: theme.palette.success.main }} />
                            <DialogContentText sx={{ textAlign: "center", marginTop: "0.5rem" }}>
                                <Typography fontWeight={700}>Notifications has been added!</Typography>
                                <Typography>You will now receive an email when new items are added to selected categories.</Typography>
                            </DialogContentText>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleSubscribeCategoryClose} startIcon={<CloseRounded />}>Done</Button>
                    </DialogActions>
                </Box>
            </Dialog>
            <ItemDialog open={detailsDialogOpen} onClose={handleDetailsClose} itemId={detailsId} guestMode />
        </>
    )
}