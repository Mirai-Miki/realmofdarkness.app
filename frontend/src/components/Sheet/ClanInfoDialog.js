import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Grid2,
} from "@mui/material";

export default function ClanInfoDialog({ open, onClose, selectedClan, clanInfo }) {
  if (!selectedClan || !clanInfo) return null;

  const infoSections = [
    { title: 'Description', content: clanInfo.description },
    { title: 'Disciplines', content: clanInfo.disciplines },
    { title: 'Clan Bane', content: clanInfo.bane },
    { title: 'Compulsion', content: clanInfo.compulsion }
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        style: {
          backgroundColor: '#1a1a1a',
          margin: '16px',
        }
      }}
    >
      <DialogTitle 
        sx={{ 
          color: '#ffd700',
          padding: { xs: 2, sm: 3 },
          fontSize: { xs: '1.2rem', sm: '1.5rem' }
        }}
      >
        {selectedClan}
      </DialogTitle>
      <DialogContent sx={{ padding: { xs: 2, sm: 3 } }}>
        <Grid2 container spacing={2}>
          {infoSections.map(({ title, content }) => (
            <Grid2 key={title} xs={12}>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  color: '#ffd700',
                  fontWeight: 'bold',
                  marginBottom: '4px',
                  marginTop: title !== 'Description' ? '8px' : 0
                }}
              >
                {title}
              </Typography>
              <Typography 
                sx={{ 
                  color: '#fff',
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  lineHeight: '1.5'
                }}
              >
                {content}
              </Typography>
            </Grid2>
          ))}
        </Grid2>
      </DialogContent>
    </Dialog>
  );
} 