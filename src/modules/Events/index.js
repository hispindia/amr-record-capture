import React from 'react'
import { withRouter } from 'react-router-dom'
import { getEvents } from '../../api/api'
import { Row, Title } from '../../helpers/helpers'
import { EventTable } from '../EventTable'

/**
 * Overview of persons.
 */
export class Events extends React.Component {
    state = {
        data: null,
        selected: null,
        approvalStatus: null,
    }

    componentDidMount = async () => {
        await this.getData()
    }

    componentDidUpdate = async () => {
        if (
            this.props.selected !== this.state.selected ||
            this.props.match.params.approvalStatus !== this.state.approvalStatus
        )
            await this.getData()
    }

    getData = async () => {
        this.setState({
            data: await getEvents(
                this.props.selected,
                this.props.match.params.approvalStatus
            ),
            selected: this.props.selected,
            approvalStatus: this.props.match.params.approvalStatus,
        })
    }

    onEventClick = row => {
        this.props.history.push(
            '/orgUnit/' + row[5] + '/entity/' + row[6] + '/event/' + row[7]
        )
    }

    render() {
        if (!this.state.data) return null

        return (
            <div style={{ margin: 16 }}>
                <Row>
                    <Title>{this.state.approvalStatus} records</Title>
                </Row>
                <div className="table">
                    <EventTable
                        data={this.state.data}
                        onEventClick={this.onEventClick}
                    />
                </div>
            </div>
        )
    }
}
