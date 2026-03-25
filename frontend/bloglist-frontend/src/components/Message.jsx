const ErrorMessage = ({ message }) => {

  if(message === null) return null

  const style = {
    color: 'red',
    background: 'lightgrey',
    fontSize: 20,
    borderStyle: 'solid',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    borderWidth: 3,
    borderColor: 'red'
  }

  return(
    <div style={style}>
      { message }
    </div>
  )
}

const ExitMessage = ({ message }) => {

  if(message === null) return null

  const style = {
    color: 'green',
    background: 'lightgrey',
    fontSize: 20,
    borderStyle: 'solid',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    borderWidth: 3,
    borderColor: 'green'
  }

  return(
    <div style={style}>
      { message }
    </div>
  )
}

export { ErrorMessage, ExitMessage }