import React, { Component } from 'react'
import { Margin } from 'helpers'
import {
    PersonForm,
    RecordForm,
    RecordPanel,
    TitleRow,
    ProgressSection,
} from 'modules'
import {
    addEvent,
    addPersonWithEvent,
    getProgramStageNew,
    getProgramStageExisting,
    updateEvent
} from 'api'
import { ButtonRow } from 'inputs'

export class RecordSections extends Component {
    state = {
        entityValues: null,
        entityValid: false,
        panelValid: false,
        eventValues: null,
        eventValid: false,
        entityId: null,
        eventId: null,
        buttonDisabled: true,
        initialized: false,
        loading: true,
        resetSwitch: false,
        recordProps: null,
    }

    componentDidMount = async () => {
        const eventId = this.props.match.params.event
            ? this.props.match.params.event
            : null
        this.setState({
            recordProps: eventId
                ? await getProgramStageExisting(eventId)
                : null,
            eventId: eventId,
            initialized: true,
            loading: false,
        })
    }

    onEntityValues = (values, entityId, valid) =>
        this.setState({
            entityValues: values,
            entityId: entityId ? entityId : null,
            entityValid: valid,
        })

    onPanelValues = async (programId, programStageId, organismCode, valid) => {
        if (valid)
            this.setState({
                loading: true,
                recordProps: null,
                disablePanel: true,
            })
        this.setState({
            programId: programId,
            programStageId: programStageId,
            organismCode: organismCode,
            panelValid: valid,
            recordProps: valid
                ? await getProgramStageNew(
                      programId,
                      programStageId,
                      organismCode
                  )
                : null,
            loading: false,
            disablePanel: false,
        })
    }

    onEventValues = (values, valid) =>
        this.setState({
            eventValues: values,
            eventValid: valid,
            buttonDisabled: false,
        })

    onSubmitClick = async addMore => {
        this.setState({ buttonDisabled: true })
        const {
            entityValues,
            programId,
            programStageId,
            eventValues,
            entityId,
            resetSwitch,
        } = this.state
        const orgUnitId = this.props.match.params.orgUnit
        let amrId
        let newEntityId
        if (entityId)
            amrId = await addEvent(
                eventValues,
                programId,
                programStageId,
                orgUnitId,
                entityId
            )
        else {
            const values = await addPersonWithEvent(
                eventValues,
                programId,
                programStageId,
                orgUnitId,
                entityValues
            )
            amrId = values.amrId
            newEntityId = values.entityId
        }
        window.alert(`AMR Id: ${amrId}`)

        if (addMore)
            this.setState({
                entityId: newEntityId ? newEntityId : entityId,
                panelValid: false,
                recordProps: null,
                eventValid: false,
                resetSwitch: !resetSwitch,
            })
        else this.props.history.push('/')
    }

    onUpdateClick = async () => {
        this.setState({ buttonDisabled: true })
        const {
            eventValues,
            eventId
        } = this.state
        await updateEvent(eventValues, eventId)
        this.props.history.push('/')
    }

    sections = () => {
        const {
            entityId,
            entityValid,
            panelValid,
            disablePanel,
            eventId,
            eventValid,
            buttonDisabled,
            resetSwitch,
            recordProps,
            loading,
        } = this.state
        const disabled =
            (!eventId && (buttonDisabled || !entityValid || !panelValid || !eventValid)) || (eventId && !eventValid)

        return (
            <div>
                {!eventId && (
                    <PersonForm
                        passValues={this.onEntityValues}
                        entityId={entityId}
                    />
                )}
                {entityValid && (
                    <RecordPanel
                        resetSwitch={resetSwitch}
                        passValues={this.onPanelValues}
                        disabled={disablePanel}
                    />
                )}
                {recordProps && (
                    <RecordForm
                        passValues={this.onEventValues}
                        programStage={recordProps.programStage}
                        rules={recordProps.rules}
                        values={recordProps.values}
                    />
                )}
                {loading && <ProgressSection />}
                <ButtonRow
                    buttons={eventId ?
                        [
                            {
                                label: 'Cancel',
                                onClick: () => this.props.history.push('/'),
                                disabled: false,
                                icon: 'clear',
                                kind: 'destructive',
                                tooltip: 'Cancel and go back.',
                                disabledTooltip: 'Cancel and go back.',
                            },
                            {
                                label: 'Submit',
                                onClick: () => this.onUpdateClick(false),
                                disabled: disabled,
                                icon: 'done',
                                kind: 'primary',
                                tooltip: 'Submit record.',
                                disabledTooltip: 'Record is unchanged.',
                            },
                        ]
                    :
                        [
                            {
                                label: 'Cancel',
                                onClick: () => this.props.history.push('/'),
                                disabled: false,
                                icon: 'clear',
                                kind: 'destructive',
                                tooltip: 'Cancel and go back.',
                                disabledTooltip: 'Cancel and go back.',
                            },
                            {
                                label: 'Submit and add new',
                                onClick: () => this.onSubmitClick(true),
                                disabled: disabled,
                                icon: 'add',
                                kind: 'primary',
                                tooltip:
                                    'Submit record and add new record for the same person.',
                                disabledTooltip: 'A required field is empty.',
                            },
                            {
                                label: 'Submit',
                                onClick: () => this.onSubmitClick(false),
                                disabled: disabled,
                                icon: 'done',
                                kind: 'primary',
                                tooltip: 'Submit record.',
                                disabledTooltip: 'A required field is empty.',
                            },
                    ]}
                />
            </div>
        )
    }

    render() {
        const { initialized } = this.state
        return (
            <Margin>
                <TitleRow
                    title="Record"
                    backPath="/"
                    history={this.props.history}
                />
                {initialized ? this.sections() : <ProgressSection />}
            </Margin>
        )
    }
}