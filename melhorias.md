## Autor: Igor Teixeira Machado
## Data: 09-03-2023

# Melhorias no código

1. Colocar em cache os dados acessados com frequência, como por exemplo, os parâmetros da requisição.

```typescript
// Original
function handleGetCameraDia(): express.RequestHandler {
  return async (req, res, next) => {
    try {
      let dia = await dbEvents.getEventByID(req.params.dia, req.params.estabelecimento, req.params.camera)
      return res.status(200).send(dia)
    } catch (e) {
      const error = e as Error
      eventErrors.handleError(error, res)
    }
  }
}

// Melhorado
function handleGetCameraDia(): express.RequestHandler {
  return async (req, res) => {
    try {
      let requestParams:ParamsDictionary = req.params
      let dia:MongoEvent[] = await dbEvents.getEventByID(requestParams.dia, requestParams.estabelecimento, requestParams.camera)
      return res.status(200).send(dia)
    } catch (e:any) {
      const error:Error = e
      eventErrors.handleError(error, res)
    }
  }
}
```

2. Maiores restrições na validação dos dados, como tamanho máximo e mínimo, caracteres permitidos e tipos de dados.

```typescript
// Original
export function validateChain(req: any) {
  const errors = validationResult(req)
  if (errors.isEmpty()) return true

  const [error] = errors.array({ onlyFirstError: true })
  throw new MissingError(error.param)
}
```

3. Gerenciamento de erros poderia ser melhorado, retornando mensagens mais detalhadas.

```typescript
// Original
export class UnauthorizedError extends ApplicationError {
  get statusCode() {
    return 401
  }
}

export class PreConditionError extends ApplicationError {
  get statusCode() {
    return 412
  }
}
```

4. Colocar o tipo das variáveis em todas as ocasiões.

```typescript
// Original
function handleGetCameraDiaQuery(): express.RequestHandler {
  return async (req, res, next) => {
    try {
      let query = { _id: req.params.dia } // query: string
      let elements = [] // elements: Query[]
      if (req.query._id) {
        elements.push({
          $eq: ['$$event._id', req.query._id]
        })

        let [resp] = await dbEvents.queryEventsByID(query, elements, req.params.estabelecimento, req.params.camera) // resp: MongoEvent[]
        return res.status(200).send(resp)
      }

      if (req.query.favorited) {
        elements.push({
          $eq: ['$$event.favorited', req.query.favorited == 'true']
        })
      }
      if (req.query.visualized && req.query.visualized != 'undefined') {
        elements.push({
          $eq: ['$$event.visualized', req.query.visualized == 'true']
        })
      }

      if (req.query.hour_init && req.query.hour_init != 'undefined' && req.query.hour_final && req.query.hour_final != 'undefined') {
        elements.push({
          $gte: ['$$event.timestamp', parseFloat(<string>req.query.hour_init)]
        })
        elements.push({
          $lte: ['$$event.timestamp', parseFloat(<string>req.query.hour_final)]
        })
      }

      if (req.query.count == '1') {
        let resp:number = await dbEvents.countEvents(query, elements, req.params.estabelecimento, req.params.camera) // resp: number
        if (!resp.length) return res.status(200).send([{ length: 0 }])
        return res.status(200).send(resp)
      }

      if (req.query.skip == undefined) throw new MissingError(FIELDS.SKIP)
      if (req.query.limit == undefined) throw new MissingError(FIELDS.LIMIT)

      let [resp] = await dbEvents.queryEvents(
        query,
        elements,
        parseInt(<string>req.query.skip),
        parseInt(<string>req.query.limit),
        req.params.estabelecimento,
        req.params.camera
      ) // resp: MongoEvent[]
      if (!resp) return res.status(200).send({})
      res.status(200).send(resp)
    } catch (e:any) {
      const error = e as Error
      eventErrors.handleError(error, res)
    }
  }
}

// Melhorado
function handleGetCameraDiaQuery(): express.RequestHandler {
  return async (req, res, next) => {
    try {
      let query:string = { _id: req.params.dia } // query: string
      let elements:Query[] = [] // elements: Query[]
      if (req.query._id) {
        elements.push({
          $eq: ['$$event._id', req.query._id]
        })

        let [resp]:MongoEvent[] = await dbEvents.queryEventsByID(query, elements, req.params.estabelecimento, req.params.camera) // resp: MongoEvent[]
        return res.status(200).send(resp)
      }

      if (req.query.favorited) {
        elements.push({
          $eq: ['$$event.favorited', req.query.favorited == 'true']
        })
      }
      if (req.query.visualized && req.query.visualized != 'undefined') {
        elements.push({
          $eq: ['$$event.visualized', req.query.visualized == 'true']
        })
      }

      if (req.query.hour_init && req.query.hour_init != 'undefined' && req.query.hour_final && req.query.hour_final != 'undefined') {
        elements.push({
          $gte: ['$$event.timestamp', parseFloat(<string>req.query.hour_init)]
        })
        elements.push({
          $lte: ['$$event.timestamp', parseFloat(<string>req.query.hour_final)]
        })
      }

      if (req.query.count == '1') {
        let resp:number = await dbEvents.countEvents(query, elements, req.params.estabelecimento, req.params.camera) // resp: number
        if (!resp.length) return res.status(200).send([{ length: 0 }])
        return res.status(200).send(resp)
      }

      if (req.query.skip == undefined) throw new MissingError(FIELDS.SKIP)
      if (req.query.limit == undefined) throw new MissingError(FIELDS.LIMIT)

      let [resp]:MongoEvent[] = await dbEvents.queryEvents(
        query,
        elements,
        parseInt(<string>req.query.skip),
        parseInt(<string>req.query.limit),
        req.params.estabelecimento,
        req.params.camera
      ) // resp: MongoEvent[]
      if (!resp) return res.status(200).send({})
      res.status(200).send(resp)
    } catch (e:any) {
      const error:Error = e
      eventErrors.handleError(error, res)
    }
  }
}
```