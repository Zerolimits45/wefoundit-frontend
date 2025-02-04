import { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AppContext } from '../../App'
import { useSnackbar } from 'notistack'
import { Card, CardContent, Grid, Typography, ButtonBase, Stack, Box } from '@mui/material'
import { makeStyles } from '@mui/styles'
import { AssignmentLateRounded, AppsRounded, RefreshRounded, AddRounded, FlagRounded, VisibilityRounded, DeleteRounded } from '@mui/icons-material'
import CardTitle from '../../components/CardTitle'
import titleHelper from '../../functions/helpers';
import { LayoutContext } from './AdminRoutes'
import { get } from 'aws-amplify/api'
import { LoadingButton } from '@mui/lab'
import { DataGrid, GridActionsCellItem, GridToolbarExport } from '@mui/x-data-grid'
import ItemDialog from '../../components/ItemDialog'

export default function AdminHome() {
    //Routes for admin pages. To add authenication so that only admins can access these pages, add a check for the user's role in the UserContext
    const { setAdminPage, user } = useContext(AppContext);
    const { setContainerWidth } = useContext(LayoutContext);
    const { enqueueSnackbar } = useSnackbar();
    const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
    const [detailsId, setDetailsId] = useState(null);
    const [optionsOpen, setOptionsOpen] = useState(false);
    const [ItemsLoading, setItemsLoading] = useState(false);
    const [items, setItems] = useState([]);
    const nf = new Intl.NumberFormat();

    const customToolbar = () => {
        return (
            <GridToolbarExport />
        );
    }

    const useStyles = makeStyles(theme => ({
        outerDiv: {
            '&:hover': {
                "& $divIcon": {
                    opacity: "0.15",
                    bottom: "-28px",
                    right: "-28px",
                    rotate: "-15deg"
                }
            }
        },
        divIcon: {
            opacity: "0",
            transitionDuration: "1s"
        }
    }));

    const columns = [
        { field: 'name', headerName: 'Item Name', width: 200 },
        { field: 'description', headerName: 'Item Description', minWidth: 150, flex: 1 },
        { field: 'categoryName', headerName: 'Item Category', minWidth: 150 },
        { field: 'created_at', headerName: 'Found On', type: 'datetime', minWidth: 150, valueGetter: (value) => new Date(value).toLocaleDateString() },
        {
            field: 'actions', type: 'actions', width: 40, getActions: (params) => [
                <GridActionsCellItem
                    icon={<VisibilityRounded />}
                    label="View Item"
                    onClick={() => {
                        setDetailsId(params.row.id)
                        setDetailsDialogOpen(true)
                    }}
                />
            ]
        },
    ];

    const iconStyles = { position: "absolute", bottom: "-48px", right: "-48px", width: "128px", height: "128px", transition: "0.5s", display: { xs: "none", md: "initial" } }
    const classes = useStyles();

    const handleDetailsClose = () => {
        setDetailsDialogOpen(false)
    }

    const handleOnDelete = () => {
        setOptionsOpen(false)
        setDetailsDialogOpen(false)
        HandleGetItems()
    }

    const HandleGetItems = async () => {
        // Fetch all tasks
        setItemsLoading(true)
        var req = get({
            apiName: "midori",
            path: "/admin/items/today",
        })

        try {
            var res = await req.response
            var data = await res.body.json()
            setItems(data)
            setItemsLoading(false)
        } catch (err) {
            console.log(err)
            enqueueSnackbar("Failed to get items", { variant: "error" })
            setItemsLoading(false)
        }
    }


    useEffect(() => {
        setContainerWidth("xl")
        setAdminPage(true)
        HandleGetItems()
    }, [])



    titleHelper("Main Dashboard")

    return (
        <>
            <Box my={"1rem"}>
                <Card>
                    <CardContent>   
                        <Grid container spacing={2} mt={"0"}>
                            <Grid item xs={12} md={6}>
                                <Card variant='draggable'>
                                    <ButtonBase className={classes.outerDiv} component={Link} to="/staff/items" sx={{ width: "100%", justifyContent: 'start' }}>
                                        <CardContent sx={{ color: "primary.main" }}>
                                            <Stack direction={{ xs: "row", md: "column" }} alignItems={{ xs: "center", md: "initial" }} spacing={{ xs: "1rem", md: 1 }}>
                                                <FlagRounded sx={{ width: { xs: "24px", sm: "36px" }, height: { xs: "24px", sm: "36px" } }} />
                                                <Box>
                                                    <Typography variant="h6" fontWeight={700}>View All Items</Typography>
                                                    <Typography variant="body1" sx={{ display: { xs: "none", sm: "initial" } }}>Manage All Lost & Found Items</Typography>
                                                </Box>
                                            </Stack>
                                        </CardContent>
                                        <FlagRounded className={classes.divIcon} sx={iconStyles} />
                                    </ButtonBase>
                                </Card>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Card variant='draggable'>
                                    <ButtonBase className={classes.outerDiv} component={Link} to="/staff/items?new=true" sx={{ width: "100%", justifyContent: 'start' }}>
                                        <CardContent sx={{ color: "primary.main" }}>
                                            <Stack direction={{ xs: "row", md: "column" }} alignItems={{ xs: "center", md: "initial" }} spacing={{ xs: "1rem", md: 1 }}>
                                                <AddRounded sx={{ width: { xs: "24px", sm: "36px" }, height: { xs: "24px", sm: "36px" } }} />
                                                <Box>
                                                    <Typography variant="h6" fontWeight={700}>Create Item</Typography>
                                                    <Typography variant="body1" sx={{ display: { xs: "none", sm: "initial" } }}>Newly Found Item</Typography>
                                                </Box>
                                            </Stack>
                                        </CardContent>
                                        <AddRounded className={classes.divIcon} sx={iconStyles} />
                                    </ButtonBase>
                                </Card>
                            </Grid>
                        </Grid>

                    </CardContent>
                </Card>
                <Grid container spacing={2} mt={"0.5rem"}>
                    <Grid item xs={12}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <CardTitle title="Items Found" icon={<AssignmentLateRounded />} />
                                    <LoadingButton onClick={HandleGetItems} loading={ItemsLoading} variant="text" startIcon={<RefreshRounded />} loadingPosition='start' size='small'>Refresh</LoadingButton>
                                </Box>
                                <DataGrid
                                    rows={items}
                                    columns={columns}
                                    pageSize={10}
                                    loading={ItemsLoading}
                                    autoHeight
                                    slots={{ toolbar: customToolbar }}
                                    sx={{ mt: "1rem" }}
                                />
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box >
            <ItemDialog open={detailsDialogOpen} onClose={handleDetailsClose} itemId={detailsId} onDelete={handleOnDelete} onUpdate={HandleGetItems} />
        </>
    )
}

