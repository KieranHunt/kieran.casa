# frozen_string_literal: true

require "time"

module Jekyll
  class PostUpdates < Generator
    safe true
    priority :high

    def generate(site)
      site.posts.docs.each do |post|
        dated_updates = Array(post.data["updates"]).map do |update|
          [update, parse_date(update["date"], post)]
        end

        post.data["latest_update"] = dated_updates.max_by(&:last)&.first
      end
    end

    private

    def parse_date(value, post)
      raise ArgumentError, "missing date" if value.nil?

      Time.parse(value.to_s)
    rescue ArgumentError => error
      raise Jekyll::Errors::FatalException,
            "#{post.relative_path} has an invalid update date: #{error.message}"
    end
  end
end
