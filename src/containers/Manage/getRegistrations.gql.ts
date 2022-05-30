import { gql } from '@apollo/client'

const GET_REGISTRATIONS = gql`
  query GetRegistrations($id: String!) {
    account(id: $id) {
      id
      registrations {
        id
        labelName
        expiryDate
      }
    }
  }
`

export default GET_REGISTRATIONS
