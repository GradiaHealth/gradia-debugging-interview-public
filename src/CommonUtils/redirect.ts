export default interface Redirect {
    Original: string,
    Code: string,
    TrackVisits: boolean,
    Created: number,
    Visits?: number
}