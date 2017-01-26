var config = {
  REDISURL: getEnv('REDISURL'),
  PORT: getEnv('PORT'),
  FOURSQUAREID: getEnv('FOURSQUAREID'),
  FOURSQUARESECRET: getEnv('FOURSQUARESECRET')
};
 
function getEnv(variable){
  if (process.env[variable] === undefined){
    throw new Error('You must create an environment variable for ' + variable);
  }
 
  return process.env[variable];
};
 
module.exports = config;
/*
export REDISURL=redis://localhost:8000;
export PORT=3000;
export FOURSQUAREID="root"
export FOURSQUARESECRET="rdymnnit";
*/