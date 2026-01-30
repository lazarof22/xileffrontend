'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, Typography, Grid, Box } from '@mui/material';

export default function dashboardPage() {
  return (
    <DashboardLayout>
      <Box >
        <Box
          sx={{
            width: '100%',
            height: 60,
            background:
              "linear-gradient(135deg, rgba(0,114,255,0.9), rgba(142,45,226,0.9)), url('https://images.unsplash.com/photo-1554224155-6726b3ff858f')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            alignContent: 'center'
          }}>
          <Typography variant="h5" color='white' sx={{ ml: 2 }}>
            Dashboard General
          </Typography>
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6">Ventas Hoy</Typography>
                <Typography variant="h4">$1,250</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6">Inventario</Typography>
                <Typography variant="h4">320 Items</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </DashboardLayout>
  );
}
