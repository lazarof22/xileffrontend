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
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
