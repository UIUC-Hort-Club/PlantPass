import { Card, CardContent, Typography } from '@mui/material';

export default function MetricCard({ title, value, prefix = "", suffix = "" }) {
  return (
    <Card>
      <CardContent>
        <Typography variant="subtitle2" color="text.secondary">
          {title}
        </Typography>
        <Typography variant="h6" color="text.primary">
          {prefix}{value}{suffix}
        </Typography>
      </CardContent>
    </Card>
  );
}