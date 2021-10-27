# Overview
this is a simple document to help out the novice, starter DBA

## User Management

### List out users

```sql
SELECT * FROM mysql.user
```

### Create new AWS IAM user

```sql
CREATE USER '__user__'@'%' IDENTIFIED WITH AWSAuthenticationPlugin as 'RDS';
GRANT SELECT ON __database__.* TO '__user__'@'%';
FLUSH PRIVILEGES;
```

### DELETE AWS IAM user

```sql
REVOKE ALL PRIVILEGES, GRANT OPTION FROM '__user__'@'%';
DROP USER '__user__'@'%';
```


### TEST New AWS IAM user

```bash
aws rds generate-db-auth-token --hostname zzz.yyy.eu-west-2.rds.amazonaws.com --port 3306 --username xxx --region eu-west-2

# Connect to VPN

# in heidi
# SSL tab -> ssl CA certificate -> point to rds-ca-2019-root.pem
# (in docs/rds-ca-2019-root.pem)

# in heidi
# connect with username and token as password
```