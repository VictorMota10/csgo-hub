import { useEffect, useState } from "react";
import './styles.scss'

export const Countdown = ({ deadline }: { deadline: any }) => {
  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  const leading0 = (num: any) => {
    return num < 10 ? "0" + num : num;
  };

  const getTimeUntil = () => {
    // Get today's date and time
    var now = new Date().getTime();

    // Find the distance between now and the count down date
    var distance = deadline - now;

    // Time calculations for days, hours, minutes and seconds
    setDays(Math.floor(distance / (1000 * 60 * 60 * 24)))
    setHours(Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)))
    setMinutes(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)))
    setSeconds(Math.floor((distance % (1000 * 60)) / 1000))
  }

  useEffect(() => {
    setInterval(() => getTimeUntil(), 1000);

    return () => getTimeUntil();
  }, [deadline]);

  return (
    <>
      <div>
        <h3 className="clock">{leading0(days)}d  {leading0(hours)}h {leading0(minutes)}m {leading0(seconds)}s</h3>
      </div>
    </>
  )
}