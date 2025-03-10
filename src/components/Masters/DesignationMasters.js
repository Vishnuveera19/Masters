import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  TextField,
  Button,
  Typography,
  FormControl,
  MenuItem,
  Select,
  FormHelperText,
  CardContent,
} from '@mui/material';
import { getRequest, postRequest } from '../../serverconfiguration/requestcomp';
import { ServerConfig } from '../../serverconfiguration/serverconfig';
import { useNavigate } from 'react-router-dom';
import { PAYMBRANCHES, PAYMCOMPANIES, PAYMDESIGNATION, SAVE } from '../../serverconfiguration/controllers';

export default function DesignationMasters() {
  const navigate = useNavigate();

  const [company, setCompany] = useState([]);
  const [branchData, setBranchData] = useState([]); // Raw branch data
  const [filteredBranches, setFilteredBranches] = useState([]); // Branches filtered by selected company
  const [pnCompanyId, setPnCompanyId] = useState('');
  const [pnBranchId, setPnBranchId] = useState('');
  const [vDesignationName, setVDesignationName] = useState('');
  const [authority, setAuthority] = useState('');
  const [status, setStatus] = useState('');

  const [companyError, setCompanyError] = useState(false);
  const [branchError, setBranchError] = useState(false);
  const [designationNameError, setDesignationNameError] = useState(false);
  const [authorityError, setAuthorityError] = useState(false);
  const [statusError, setStatusError] = useState(false);

  useEffect(() => {
    async function getData() {
      try {
        const companyData = await getRequest(ServerConfig.url, PAYMCOMPANIES);
        setCompany(companyData.data);
        const branchData = await getRequest(ServerConfig.url, PAYMBRANCHES);
        setBranchData(branchData.data);
        setFilteredBranches(branchData.data); // Initialize with all branches
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
    getData();
  }, []);

  useEffect(() => {
    if (pnCompanyId) {
      const filtered = branchData.filter(branch => branch.pnCompanyId === pnCompanyId);
      setFilteredBranches(filtered);
      setPnBranchId(''); // Reset branch selection
    } else {
      setFilteredBranches(branchData); // Show all branches if no company is selected
    }
  }, [pnCompanyId, branchData]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    switch (name) {
      case 'pnCompanyId':
        setPnCompanyId(value);
        setCompanyError(false);
        break;
      case 'pnBranchId':
        setPnBranchId(value);
        setBranchError(false);
        break;
      case 'v_DesignationName':
        setVDesignationName(value);
        setDesignationNameError(!/^[A-Za-z0-9\s]{1,40}$/.test(value));
        break;
      case 'authority':
        setAuthority(value.toUpperCase());
        setAuthorityError(!/^[A-Za-z]{1}$/.test(value));
        break;
      case 'status':
        setStatus(value.toUpperCase());
        setStatusError(!/^[A-Za-z]{1}$/.test(value));
        break;
      default:
        break;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const hasError = !pnCompanyId || !pnBranchId || !/^[A-Za-z0-9\s]{1,40}$/.test(vDesignationName) ||
                     !/^[A-Za-z]{1}$/.test(authority) || !/^[A-Za-z]{1}$/.test(status);

    setCompanyError(!pnCompanyId);
    setBranchError(!pnBranchId);
    setDesignationNameError(!/^[A-Za-z0-9\s]{1,40}$/.test(vDesignationName));
    setAuthorityError(!/^[A-Za-z]{1}$/.test(authority));
    setStatusError(!/^[A-Za-z]{1}$/.test(status));

    if (hasError) {
      return;
    }

    const formData = {
      pnCompanyId,
      pnBranchId,
      vDesignationName,
      authority,
      status,
    };

    try {
      const response = await postRequest(ServerConfig.url, SAVE, {
        query: `INSERT INTO [dbo].[paym_Designation]([pn_CompanyID],[BranchID],[v_DesignationName],[Authority],[status]) VALUES (${pnCompanyId},${pnBranchId},'${vDesignationName}','${authority}','${status}')`
      });

      if (response.status === 200) {
        alert('Data saved successfully');
        navigate('/PaymDesignationTable');
      } else {
        alert('Failed to save data');
      }
    } catch (error) {
      console.error('Error saving data:', error);
      alert('Failed to save data');
    }
  };

  return (
    <div>
      <Grid style={{ padding: '80px 5px 0 5px' }}>
        <Card style={{ maxWidth: 600, margin: '0 auto' }}>
          <CardContent>
            <Typography variant="h5" color="textPrimary" align="center">
              Designation Form
            </Typography>
            <Typography variant='subtitle1' color="textSecondary" align='center' marginBottom={3}>
            </Typography>
            
            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <Select
                      value={pnCompanyId}
                      onChange={handleChange}
                      name="pnCompanyId"
                      displayEmpty
                      style={{ height: '50px' }}
                    >
                      <MenuItem value="">
                        Select a Company Name
                      </MenuItem>
                      {company.map((e) => (
                        <MenuItem key={e.pnCompanyId} value={e.pnCompanyId}>
                          {e.companyName}
                        </MenuItem>
                      ))}
                    </Select>
                    {companyError && (
                      <FormHelperText sx={{ color: 'red' }}>
                        Please select a Company Name
                      </FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <Select
                      value={pnBranchId}
                      onChange={handleChange}
                      name="pnBranchId"
                      displayEmpty
                      style={{ height: '50px' }}
                      disabled={!pnCompanyId} // Disable branch dropdown if no company is selected
                    >
                      <MenuItem value="">
                        Select a Branch Name
                      </MenuItem>
                      {filteredBranches.map((e) => (
                        <MenuItem key={e.pnBranchId} value={e.pnBranchId}>
                          {e.branchName}
                        </MenuItem>
                      ))}
                    </Select>
                    {branchError && (
                      <FormHelperText sx={{ color: 'red' }}>
                        Please select a Branch Name
                      </FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={designationNameError}>
                    <TextField
                      name="v_DesignationName"
                      label="V_DesignationName"
                      variant="outlined"
                      fullWidth
                      required
                      value={vDesignationName}
                      onChange={handleChange}
                      InputLabelProps={{ shrink: true }}
                    />
                    {designationNameError && (
                      <FormHelperText sx={{ color: 'red' }}>
                        Please enter a valid Designation Name (alphanumeric characters, max length 40)
                      </FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={authorityError}>
                    <TextField
                      name="authority"
                      label="Authority"
                      variant="outlined"
                      fullWidth
                      required
                      value={authority}
                      onChange={handleChange}
                      InputLabelProps={{ shrink: true }}
                    />
                    {authorityError && (
                      <FormHelperText sx={{ color: 'red' }}>
                        Please enter a valid Authority (only alphabetic characters)
                      </FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={statusError}>
                    <TextField
                      name="status"
                      label="Status"
                      variant="outlined"
                      fullWidth
                      required
                      value={status}
                      onChange={handleChange}
                      InputLabelProps={{ shrink: true }}
                    />
                    {statusError && (
                      <FormHelperText sx={{ color: 'red' }}>
                        Please enter a valid Status (only alphabetic characters)
                      </FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                <Grid container spacing={1} paddingTop={'10px'}>
                  <Grid item xs={12} align="right">
                    <Button style={{ margin: '0 5px' }} type="submit" variant="contained" color="primary">
                      SAVE
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Grid>
    </div>
  );
}
