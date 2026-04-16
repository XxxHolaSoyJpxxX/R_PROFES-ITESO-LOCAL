// En desarrollo Angular corre en :4200 y usa el proxy para evitar CORS
export const environment = {
  keycloakUrl:    '',           // vacío = usa proxy /keycloak
  keycloakRealm:  'iteso',
  keycloakClient: 'iteso-backend',
  keycloakSecret: 'iteso-secret-local',
  apiUrl:         '/api',
  useKeycloakProxy: true,       // flag para el login component
};
