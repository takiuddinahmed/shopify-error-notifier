import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { login } from "../../shopify.server";

import styles from "./styles.module.css";

import {
  NotificationFilledIcon,
  ClockIcon,
  CheckCircleIcon,
} from "@shopify/polaris-icons";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);

  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }

  return { showForm: Boolean(login) };
};

export default function App() {
  const { showForm } = useLoaderData<typeof loader>();

  return (
    <div className={styles.index}>
      <div className={styles.content}>
        <h1 className={styles.heading}>Alert Notifier for Shopify</h1>
        <p className={styles.text}>
          Never miss a critical event. Get instant notifications when things
          happen in your store.
        </p>

        {showForm && (
          <div className={styles.card}>
            <form className={styles.form} method="post" action="/auth/login">
              <div className={styles.formContent}>
                <h2 className={styles.headingLg}>Connect your store</h2>
                <p className={styles.text}>
                  Enter your Shopify store domain to get started with Alert
                  Notifier
                </p>
                <div className={styles.inputGroup}>
                  <input
                    className={styles.textField}
                    type="text"
                    name="shop"
                    placeholder="your-store.myshopify.com"
                  />
                  <button className={styles.button} type="submit">
                    Log in
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        <div className={styles.features}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <NotificationFilledIcon />
            </div>
            <h1 className={styles.featureTitle}>Instant Alerts</h1>
            <p className={styles.featureDescription}>
              Receive real-time notifications for all important events in your
              Shopify store
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <ClockIcon />
            </div>
            <h3 className={styles.featureTitle}>24/7 Monitoring</h3>
            <p className={styles.featureDescription}>
              Round-the-clock event monitoring ensures you never miss important
              updates
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <CheckCircleIcon />
            </div>
            <h1 className={styles.featureTitle}>Reliable Delivery</h1>
            <p className={styles.featureDescription}>
              Guaranteed notification delivery through multiple channels for
              critical events
            </p>
          </div>
        </div>

        <p className={styles.disclaimer}>
          By connecting your store, you agree to receive notifications for
          important events and updates.
        </p>
      </div>
    </div>
  );
}
