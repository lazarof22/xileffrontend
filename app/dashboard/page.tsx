'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, Typography, Grid, Box } from '@mui/material';

export default function dashboardPage() {
  return (
    <DashboardLayout>
      <Box sx={{}}>
        <Typography variant="h5" gutterBottom>
          Dashboard General
        </Typography>

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
