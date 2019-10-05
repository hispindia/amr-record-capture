import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { showAlert } from '@hisp-amr/app'
import { getEvent, putEvent } from '@hisp-amr/api'
import { setValues } from './setValues'

export const useBatch = (
    eventIds,
    { batchId, received, dispatched, dispatchStatus }
) => {
    const dispatch = useDispatch()

    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    useEffect(() => {
        const getData = async () => {
            setLoading(true)

            console.log(eventIds, batchId, received, dispatched, dispatchStatus)

            try {
                const events = (await Promise.all(
                    eventIds.map(async e => await getEvent(e))
                )).map(e =>
                    setValues(e, {
                        batchId,
                        received,
                        dispatched,
                        dispatchStatus,
                    })
                )

                console.log(events)

                console.log(events.filter(e => e.updateNeeded))

                /*const response = await Promise.all(
                    events
                        .filter(e => e.updateNeeded)
                        .forEach(async e => await putEvent(e))
                )*/

                //console.log(response)

                setData(events)
                setError(false)
            } catch (e) {
                if (e === 404) {
                    setData([])
                    setError(false)
                } else {
                    console.error(e)
                    dispatch(
                        showAlert('Failed to get sample batches', {
                            critical: true,
                        })
                    )
                    setError(true)
                }
            } finally {
                setLoading(false)
            }
        }

        if (eventIds) getData()
    }, [eventIds])

    const mutate = async (eventId, dataElement, value) => {
        const newData = [...data]

        const event = newData.find(e => e.event === eventId)

        const dataValue = event.dataValues.find(
            dv => dv.dataElement === dataElement
        )

        if (!dataValue) event.dataValues.push({ dataElement, value })
        else dataValue.value = value

        setData(newData)
    }

    return { data, loading, error, mutate }
}
